import { IsString, IsNotEmpty, IsEmail } from "class-validator"

export class VerifyOtpDto { 
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email!: string
    
    @IsString()
    @IsNotEmpty()
    code!: string
}