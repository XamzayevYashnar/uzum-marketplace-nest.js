import { 
  ConflictException, 
  Injectable, 
  UnauthorizedException, 
  ForbiddenException 
} from "@nestjs/common"; 
import { PrismaService } from "../../config/database/prisma.service"; 
import { SignInDto } from "../types/sign-in-dto"; 
import { Crypt } from "../../infrastructure/lib/Crypt"; 
import { Token } from "../../infrastructure/lib/Token"; 
import type { Response } from "express"; 
import type { AllowedModels } from "../enum";

@Injectable() 
export class AuthService { 
  constructor( 
    protected readonly prisma: PrismaService, 
    protected readonly model: AllowedModels, 
  ) {} 

  async checkEmailPassword(email: string, password: string) { 
    const userExists = await this.prisma.user.findUnique({ where: { email } }); 
    
    if (!userExists) { 
      throw new UnauthorizedException("Email or password is incorrect"); 
    } 

    const isMatch = await Crypt.compare(password, userExists.hashedPassword); 
    if (!isMatch) { 
      throw new UnauthorizedException("Email or password is incorrect"); 
    } 

    const modelService = (this.prisma as any)[this.model]; 

    if (!modelService) { 
      throw new ConflictException("Configuration error"); 
    } 

    const modelExists = await modelService.findUnique({ where: { id: userExists.id } });

    if (!modelExists) { 
      throw new ForbiddenException("You don't have permissions for this sub-system"); 
    } 

    return { 
      sub: userExists.id, 
      role: modelExists.role, 
      status: modelExists.status 
    }; 
  } 

  async signIn(dto: SignInDto, res: Response) { 
    const payload = await this.checkEmailPassword(dto.email, dto.password); 
    
    const accessToken = await Token.accessToken(payload); 
    const refreshToken = await Token.refreshToken(payload); 
    
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }); 

    return { accessToken }; 
  } 
}
