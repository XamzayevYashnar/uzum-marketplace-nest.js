import { 
  ConflictException, 
  Injectable, 
  UnauthorizedException, 
  ForbiddenException, 
  BadRequestException 
} from "@nestjs/common"; 
import { PrismaService } from "../../config/database/prisma.service"; 
import { SignInDto } from "../types/sign-in-dto"; 
import { Crypt } from "../../infrastructure/lib/Crypt"; 
import { Token } from "../../infrastructure/lib/Token"; 
import type { Response } from "express"; 
import type { AllowedModels } from "../enum"; 
import { MailService } from "../../modules/mail/mail.service"; 
import { VerifyOtpDto } from "../types/verify-otp-dto"; 
import { SignUpDto } from "../types/sign-up-dto"; 
import { Roles } from "../../../generated/prisma/enums"; 

@Injectable() 
export class AuthService { 
  constructor( 
    protected readonly prisma: PrismaService, 
    protected readonly model: AllowedModels, 
    private readonly mail: MailService 
  ) {} 

  private async validateModelAccess(userId: string) {
    const modelService = (this.prisma as any)[this.model]; 
    if (!modelService) { 
      throw new ConflictException("Tizim konfiguratsiyasida xatolik: model topilmadi"); 
    } 

    const modelExists = await modelService.findUnique({ where: { userId } }); 
    
    if (!modelExists) { 
      throw new ForbiddenException("Sizda ushbu quyi tizimga kirish ruxsati yo'q"); 
    } 

    return modelExists;
  }

  async checkEmailPassword(email: string, password: string) { 
    const userExists: any = await this.prisma.user.findUnique({ where: { email } }); 
    if (!userExists) { 
      throw new UnauthorizedException("Email yoki parol noto'g'ri"); 
    } 

    const isMatch = await Crypt.compare(password, userExists.hashedPassword); 
    if (!isMatch) { 
      throw new UnauthorizedException("Email yoki parol noto'g'ri"); 
    } 

    await this.validateModelAccess(userExists.id);

    return userExists; 
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

  async verifyOtp(dto: VerifyOtpDto, res: Response) { 
    await this.mail.verifyOtp(dto.email, dto.code); 

    const userExists: any = await this.prisma.user.findUnique({ where: { email: dto.email } }); 
    if (!userExists) { 
      throw new UnauthorizedException("Foydalanuvchi topilmadi"); 
    } 

    const modelExists = await this.validateModelAccess(userExists.id);

    const payload = { 
      sub: modelExists.userId, 
      role: modelExists.role, 
      status: modelExists.status, 
    }; 

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

  async isDuplicateEmail(email: string): Promise<void> { 
    const userExists = await this.prisma.user.findUnique({ where: { email } }); 
    if (userExists) { 
      throw new ConflictException("Ushbu email allaqachon ro'yxatdan o'tgan"); 
    } 
  } 

  async signUp(dto: SignUpDto) { 
    await this.isDuplicateEmail(dto.email); 

    const { password, ...res } = dto; 
    const hashedPassword = await Crypt.hash(password); 

    const newUser = await this.prisma.user.create({ 
      data: { ...res, hashedPassword } 
    }); 

    const modelService = (this.prisma as any)[this.model]; 
    if (!modelService) { 
      throw new ConflictException("Tizim konfiguratsiyasida xatolik"); 
    } 

    const roleKey = this.model.toUpperCase() as keyof typeof Roles;

    await modelService.create({ 
      data: { 
        userId: newUser.id, 
        role: Roles?.[roleKey], 
      } 
    }); 

    return { status: "User is success created, please loginIn!" }; 
  } 

  async refreshToken(token: string) { 
    const payload = await Token.verifyRefresh(token); 

    const existsUser = await this.prisma.user.findUnique({ where: { id: payload.sub } }); 

    if (!existsUser) { 
      throw new BadRequestException("Foydalanuvchi topilmadi"); 
    } 

    const modelExists = await this.validateModelAccess(payload.sub); 

    const newPayload = {
      sub: modelExists.userId,
      role: modelExists.role,
      status: modelExists.status,
    };

    return { 
      accessToken: await Token.accessToken(newPayload) 
    }; 
  } 
}
