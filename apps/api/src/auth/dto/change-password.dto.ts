import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(256)
  previousPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(256)
  proposedPassword: string;
}
