import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoService } from './cognito.service.js';
import type { SignUpDto } from './dto/sign-up.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ConfirmSignUpDto } from './dto/confirm-sign-up.dto.js';
import type { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

function cognitoErrorName(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = (error as { name?: unknown }).name;
    return typeof name === 'string' ? name : undefined;
  }
  return undefined;
}

function cognitoErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
}

function rethrowCognitoError(error: unknown): never {
  switch (cognitoErrorName(error)) {
    case 'UsernameExistsException':
      throw new ConflictException(
        'An account with this email already exists.',
      );
    case 'InvalidPasswordException':
      throw new BadRequestException(
        'Password does not meet the password policy requirements.',
      );
    case 'InvalidParameterException': {
      const message = cognitoErrorMessage(error) ?? '';
      if (message.includes('flow not enabled')) {
        throw new BadRequestException(
          'USER_PASSWORD_AUTH is not enabled for this Cognito app client. Enable ALLOW_USER_PASSWORD_AUTH in the Cognito console.',
        );
      }
      throw new BadRequestException(message || 'Invalid request parameters.');
    }
    case 'CodeMismatchException':
      throw new BadRequestException('Invalid verification code.');
    case 'ExpiredCodeException':
      throw new BadRequestException(
        'The verification code has expired. Request a new one.',
      );
    case 'UserNotConfirmedException':
      throw new ForbiddenException(
        'Account is not confirmed. Verify your email before logging in.',
      );
    case 'PasswordResetRequiredException':
      throw new ForbiddenException(
        'A password reset is required before logging in.',
      );
    case 'NotAuthorizedException':
      throw new UnauthorizedException('Invalid email or password.');
    case 'UserNotFoundException':
      throw new UnauthorizedException('Invalid email or password.');
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    default:
      throw error;
  }
}

@Injectable()
export class AuthService {
  constructor(private readonly cognito: CognitoService) {}

  async signUp(dto: SignUpDto) {
    try {
      const result = await this.cognito.signUp(dto);
      return {
        ...result,
        message: result.userConfirmed
          ? 'Account created successfully.'
          : 'Account created. Check your email for a verification code.',
      };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async confirmSignUp(dto: ConfirmSignUpDto) {
    try {
      await this.cognito.confirmSignUp(dto.username, dto.code);
      return { message: 'Email verified successfully. You can now log in.' };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async resendConfirmationCode(username: string) {
    try {
      await this.cognito.resendConfirmationCode(username);
      return { message: 'A new verification code has been sent.' };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async login(dto: LoginDto) {
    try {
      const tokens = await this.cognito.login(dto.email, dto.password);
      const user = await this.cognito.getUser(tokens.accessToken);
      return { tokens, user };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async refresh(email: string, refreshToken: string) {
    try {
      return await this.cognito.refreshTokens(email, refreshToken);
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async logout(accessToken: string) {
    try {
      await this.cognito.logout(accessToken);
      return { message: 'Logged out successfully.' };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async forgotPassword(email: string) {
    const message =
      'If an account exists for this email, a password reset code has been sent.';

    try {
      await this.cognito.forgotPassword(email);
      return { message };
    } catch (error) {
      if (cognitoErrorName(error) === 'UserNotFoundException') {
        return { message };
      }
      rethrowCognitoError(error);
    }
  }

  async confirmForgotPassword(dto: ConfirmForgotPasswordDto) {
    try {
      await this.cognito.confirmForgotPassword(
        dto.email,
        dto.code,
        dto.password,
      );
      return {
        message: 'Password reset successfully. You can now log in.',
      };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async changePassword(accessToken: string, dto: ChangePasswordDto) {
    try {
      await this.cognito.changePassword(
        accessToken,
        dto.previousPassword,
        dto.proposedPassword,
      );
      return { message: 'Password changed successfully.' };
    } catch (error) {
      rethrowCognitoError(error);
    }
  }

  async me(accessToken: string) {
    try {
      return await this.cognito.getUser(accessToken);
    } catch (error) {
      rethrowCognitoError(error);
    }
  }
}
