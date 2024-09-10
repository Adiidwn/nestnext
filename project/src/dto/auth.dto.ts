import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  email: string = '';

  @IsNotEmpty()
  password: string = '';
}

export class AuthRegisterDto {
  @IsNotEmpty()
  name: string = '';

  @IsNotEmpty()
  password: string = '';

  @IsEmail()
  email: string = '';
}

export class AuthUpdateDto {
  @IsNotEmpty()
  name: string = '';

  @IsNotEmpty()
  password: string = '';
}
