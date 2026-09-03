import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUrl, Length } from "class-validator";


export class CreateAdminDto {
    @IsString()
    @IsNotEmpty()
    @Length(5, 255, { message: "Email 5 ta harfdan kamroq bulmasligi shart va 255 ta harfdan oshmaligi ham shart!" })
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    password!: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Length(5, 50, { message: "Ism-Familiya 5 ta harfdan kam bulmasligi kerak va 50 ta harfdan xam oshmasligi ham shart" })
    fullName?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    imageUrl?: string;
}