import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail } from "class-validator"

export class SignInDto {
    @ApiProperty({ example: "admin@gmail.com", description: "Enter email", format: "email" })
    @IsString({ message: "Email String formatida bo'lishi shart" })
    @IsNotEmpty({ message: "Email bush bulmasligi shart" })
    @IsEmail()
    email!: string

    @ApiPropertyOptional({ example: "Admin123!", description: "Enter password", format: "password" })
    @IsString({ message: "Parol string formatida bulishi shart" })
    @IsNotEmpty({ message: "Parol bush bulmasligi shart" })
    password!: string
}