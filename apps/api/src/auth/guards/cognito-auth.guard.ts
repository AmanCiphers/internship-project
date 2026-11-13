import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { requireEnv } from '../../config/env.js';
import { extractAccessToken } from '../auth-token.js';

export interface AuthenticatedRequest extends Request {
  user: CognitoAccessTokenPayload;
  accessToken: string;
}

interface Verifier {
  verify(token: string): Promise<CognitoAccessTokenPayload>;
}

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private verifier?: Verifier;

  private getVerifier(): Verifier {
    this.verifier ??= CognitoJwtVerifier.create({
      userPoolId: requireEnv('COGNITO_USER_POOL_ID'),
      clientId: requireEnv('COGNITO_CLIENT_ID'),
      tokenUse: 'access',
    });
    return this.verifier;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      request.user = await this.getVerifier().verify(token);
      request.accessToken = token;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
