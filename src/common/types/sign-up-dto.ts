import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 50)
    fullName!: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    imageUrl?: string
}