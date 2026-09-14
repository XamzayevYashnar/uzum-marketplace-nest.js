import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";

export class CreateAdminDto {
  @ApiProperty({ 
    example: "admin@gmail.com", 
    description: "The email address",
    minLength: 5,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 255, { message: "Email 5 ta harfdan kam bo'lmasligi va 255 ta harfdan oshmasligi shart!" })
  @IsEmail()
  email!: string;

  @ApiProperty({ 
    example: "Admin123!",
    description: "Enter your password" 
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;

  @ApiPropertyOptional({ 
    example: "Xamzayev Yashnarbek", 
    description: "Enter your full name",
    minLength: 5,
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @Length(5, 50, { message: "Ism-Familiya 5 ta harfdan kam bo'lmasligi va 50 ta harfdan oshmasligi shart!" })
  fullName?: string;

  @ApiPropertyOptional({ 
    example: "https://example.com/image.png", 
    description: "Enter your image URL",
    format: 'url'
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
