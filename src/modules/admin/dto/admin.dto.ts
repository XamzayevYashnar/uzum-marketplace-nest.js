import { IsNotEmpty, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class AdminDto {
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phone!: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;
}
