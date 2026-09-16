import { 
  ConflictException, 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  ForbiddenException
} from "@nestjs/common"; 
import { PrismaService } from "../../config/database/prisma.service"; 
import { SignInDto } from "../dto/auth/sign-in-dto"; 
import { Crypt } from "../../infrastructure/lib/Crypt"; 
import { Token } from "../../infrastructure/lib/Token"; 
import type { Response } from "express"; 
import type { AllowedModels } from "../enum"; 
import { MailService } from "../mail/mail.service"; 
import { VerifyOtpDto } from "../dto/auth/verify-otp-dto"; 
import { SignUpDto } from "../dto/auth/sign-up-dto"; 
import { Roles } from "../../../generated/prisma/enums"; 
import { MainService } from "./main.service";
import { getDeviceInfo } from "../utils/device-info";
import type { Request } from "express";

@Injectable() 
export class AuthService extends MainService { 
  constructor( 
    protected readonly prisma: PrismaService, 
    protected readonly model: AllowedModels, 
    private readonly mail: MailService
  ) {
    super(prisma, model)
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

  async signOut(token: string){
    const payload = await Token.verifyRefresh(token);

    await this.prisma.session.delete({
      where: { id: payload.sessionId }
    });

    return {
      success: true,
      message: "User is success logout from device"
    };
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

  async verifyOtp(dto: VerifyOtpDto, res: Response, req: Request, ip: any) { 
    await this.mail.verifyOtp(dto.email, dto.code);

    const userExists: any = await this.prisma.user.findUnique({ where: { email: dto.email } }); 

    if (!userExists) { 
      throw new UnauthorizedException("Foydalanuvchi topilmadi"); 
    } 

    const modelExists = await this.validateModelAccess(userExists.id);

    const device = getDeviceInfo(req);

    const devicesExists = await this.prisma.session.findMany({
      where: { userId: userExists.id }
    });

    if (devicesExists?.length >= 2) { 
      throw new ForbiddenException("Devices count should be exactly 2"); 
    };

    const newSession = await this.prisma.session.create({
      data: {
        userId: userExists.id,
        ipAddress: ip,
        deviceType: device.device.type || "desktop",
        os: device.os.name ? `${device.os.name} ${device.os.version || ''}` : "Unknown device name",
        browser: device.browser?.name ? `${device.browser.name} ${device.browser.version || ''}` : "Unknown Browser"
      },
    })

    const payload = { 
      sub: modelExists.userId, 
      role: modelExists.role, 
      status: modelExists.status, 
      sessionId: newSession.id,
    }; 

    const accessToken = await Token.accessToken(payload); 
    const refreshToken = await Token.refreshToken(payload); 

    Token.setCookie(res, refreshToken, accessToken);

    return { 
      success: true,
      message: "Tokens is success created",
      data: newSession,
    }; 
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
      sessionId: payload.sessionId,
    };

    return { 
      accessToken: await Token.accessToken(newPayload) 
    }; 
  } 
}
