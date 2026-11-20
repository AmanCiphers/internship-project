import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(3, 128)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username may only contain letters, numbers, dots, underscores, and hyphens',
  })
  username: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(256)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
