import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
