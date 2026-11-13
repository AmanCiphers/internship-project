import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto.js';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CognitoAuthGuard } from './guards/cognito-auth.guard.js';
import { AccessToken } from './decorators/current-user.decorator.js';
import { extractAccessToken } from './auth-token.js';
import { clearAuthCookies, setAuthCookies } from './auth-cookies.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmSignUp(@Body() dto: ConfirmSignUpDto) {
    return this.authService.confirmSignUp(dto);
  }

  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  resendConfirmationCode(@Body() dto: ResendConfirmationDto) {
    return this.authService.resendConfirmationCode(dto.username);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { tokens, user } = await this.authService.login(dto);
    setAuthCookies(response, tokens, dto.email);
    return { user, expiresIn: tokens.expiresIn };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = request.cookies as Record<string, string> | undefined;
    const email = dto.email ?? cookies?.auth_email;
    const refreshToken = dto.refreshToken ?? cookies?.refresh_token;

    if (!email || !refreshToken) {
      throw new UnauthorizedException('No active session. Please log in again.');
    }

    const tokens = await this.authService.refresh(email, refreshToken);
    setAuthCookies(response, tokens, email);
    return { expiresIn: tokens.expiresIn };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('confirm-forgot-password')
  @HttpCode(HttpStatus.OK)
  confirmForgotPassword(@Body() dto: ConfirmForgotPasswordDto) {
    return this.authService.confirmForgotPassword(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = extractAccessToken(request);
    clearAuthCookies(response);

    if (accessToken) {
      await this.authService.logout(accessToken).catch(() => undefined);
    }

    return { message: 'Logged out successfully.' };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CognitoAuthGuard)
  changePassword(
    @AccessToken() accessToken: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(accessToken, dto);
  }

  @Get('me')
  @UseGuards(CognitoAuthGuard)
  me(@AccessToken() accessToken: string) {
    return this.authService.me(accessToken);
  }
}
