import { 
  ConflictException, 
  Injectable, 
  UnauthorizedException, 
  ForbiddenException, 
  NotFoundException
} from "@nestjs/common"; 
import { PrismaService } from "../../config/database/prisma.service"; 
import { SignInDto } from "../types/sign-in-dto"; 
import { Crypt } from "../../infrastructure/lib/Crypt"; 
import { Token } from "../../infrastructure/lib/Token"; 
import type { Response } from "express"; 
import type { AllowedModels } from "../enum";
import { MailService } from "../../modules/mail/mail.service";
import { VerifyOtpDto } from "../types/verify-otp-dto";

@Injectable() 
export class AuthService { 
  constructor( 
    protected readonly prisma: PrismaService, 
    protected readonly model: AllowedModels,
    private readonly mail: MailService 
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

    return userExists
  } 

  async signIn(dto: SignInDto) { 
    const user = await this.checkEmailPassword(dto.email, dto.password);
    
    await this.mail.sendOtp(dto.email);

    return {
      message: 'Tasdiqlash kodi emailingizga yuborildi',
      email: user.email,
      step: 'OTP_REQUIRED',
    };
  } 

  async verifyOtp(dto: VerifyOtpDto, res: Response){
    await this.mail.verifyOtp(dto.email, dto.code);

    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } }); 
    
    if (!userExists) { 
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

    const payload = {
      sub: modelExists.userId,
      role: modelExists.role,
      status: modelExists.role,
    }

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
