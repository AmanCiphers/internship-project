import { createHmac } from 'node:crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from '@aws-sdk/client-cognito-identity-provider';
import { optionalEnv, requireEnv } from '../config/env.js';

export interface CognitoTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
  name?: string;
}

@Injectable()
export class CognitoService {
  private client?: CognitoIdentityProviderClient;

  private get identityProvider(): CognitoIdentityProviderClient {
    if (!this.client) {
      this.client = new CognitoIdentityProviderClient({
        region: requireEnv('AWS_REGION'),
      });
    }
    return this.client;
  }

  private get clientId(): string {
    return requireEnv('COGNITO_CLIENT_ID');
  }

  private secretHash(username: string): string | undefined {
    const clientSecret = optionalEnv('COGNITO_CLIENT_SECRET');
    if (!clientSecret) {
      return undefined;
    }
    return createHmac('sha256', clientSecret)
      .update(`${username}${this.clientId}`)
      .digest('base64');
  }

  async signUp({ username, email, password, name }: SignUpInput) {
    const attributes = [{ Name: 'email', Value: email }];
    if (name) {
      attributes.push({ Name: 'name', Value: name });
    }

    const result = await this.identityProvider.send(
      new SignUpCommand({
        ClientId: this.clientId,
        Username: username,
        Password: password,
        SecretHash: this.secretHash(username),
        UserAttributes: attributes,
      }),
    );

    return {
      userConfirmed: result.UserConfirmed ?? false,
      userSub: result.UserSub,
      username,
    };
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.identityProvider.send(
      new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
        SecretHash: this.secretHash(email),
      }),
    );
  }

  async resendConfirmationCode(email: string): Promise<void> {
    await this.identityProvider.send(
      new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: email,
        SecretHash: this.secretHash(email),
      }),
    );
  }

  async login(email: string, password: string): Promise<CognitoTokens> {
    const result = await this.identityProvider.send(
      new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          ...(this.secretHash(email)
            ? { SECRET_HASH: this.secretHash(email) }
            : {}),
        },
      }),
    );

    return this.toTokens(result.AuthenticationResult);
  }

  async refreshTokens(
    email: string,
    refreshToken: string,
  ): Promise<CognitoTokens> {
    const result = await this.identityProvider.send(
      new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          ...(this.secretHash(email)
            ? { SECRET_HASH: this.secretHash(email) }
            : {}),
        },
      }),
    );

    return this.toTokens(result.AuthenticationResult);
  }

  async logout(accessToken: string): Promise<void> {
    await this.identityProvider.send(
      new GlobalSignOutCommand({ AccessToken: accessToken }),
    );
  }

  async forgotPassword(email: string): Promise<void> {
    await this.identityProvider.send(
      new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        SecretHash: this.secretHash(email),
      }),
    );
  }

  async confirmForgotPassword(
    email: string,
    code: string,
    password: string,
  ): Promise<void> {
    await this.identityProvider.send(
      new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: password,
        SecretHash: this.secretHash(email),
      }),
    );
  }

  async changePassword(
    accessToken: string,
    previousPassword: string,
    proposedPassword: string,
  ): Promise<void> {
    await this.identityProvider.send(
      new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: previousPassword,
        ProposedPassword: proposedPassword,
      }),
    );
  }

  async getUser(accessToken: string) {
    const result = await this.identityProvider.send(
      new GetUserCommand({ AccessToken: accessToken }),
    );

    const attributes = Object.fromEntries(
      (result.UserAttributes ?? [])
        .filter((attribute) => attribute.Name && attribute.Value)
        .map((attribute) => [attribute.Name!, attribute.Value!]),
    );

    return {
      username: result.Username,
      ...attributes,
    };
  }

  private toTokens(
    result: AuthenticationResultType | undefined,
  ): CognitoTokens {
    if (!result?.AccessToken) {
      throw new InternalServerErrorException(
        'Cognito did not return an access token',
      );
    }

    return {
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresIn: result.ExpiresIn,
      tokenType: result.TokenType,
    };
  }
}
