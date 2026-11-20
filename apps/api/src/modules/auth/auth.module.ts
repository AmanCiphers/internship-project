import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CognitoService } from './cognito.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CognitoService],
  exports: [AuthService, CognitoService],
})
export class AuthModule {}
