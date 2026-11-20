import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRestroDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;
}
