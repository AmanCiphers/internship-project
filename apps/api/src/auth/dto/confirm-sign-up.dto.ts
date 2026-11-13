import { IsString, Length, MaxLength } from 'class-validator';

export class ConfirmSignUpDto {
  @IsString()
  @Length(3, 128)
  @MaxLength(128)
  username: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
