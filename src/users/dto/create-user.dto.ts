import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener Mayusculas, minusculas y numeros',
  })
  readonly password: string;

  @IsNotEmpty()
  readonly rol: string;
}

export class CreateUserAdminDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener Mayusculas, minusculas y numeros',
  })
  readonly password: string;
}

export class CreateUserRootDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener Mayusculas, minusculas y numeros',
  })
  readonly password: string;

  @IsNotEmpty()
  readonly key: string;
}
