import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail } from "class-validator"

export class VerifyOtpDto { 
    @ApiProperty({ example: "admin@gmail.com", description: "Enter email", format: "email" })
    @IsString({ message: "Email String formatida bo'lishi shart" })
    @IsNotEmpty({ message: "Email bush bulmasligi shart" })
    @IsEmail()
    email!: string
    
    @IsString({ message: "Code String formatida bo'lishi shart" })
    @IsNotEmpty({ message: "Code bush bulmasligi shart" })
    @ApiProperty({ example: "123456", description: "Enter password from email, otp code" })
    code!: string
}