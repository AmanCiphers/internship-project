import { IsString, Length } from 'class-validator';

export class ResendConfirmationDto {
  @IsString()
  @Length(3, 128)
  username: string;
}
