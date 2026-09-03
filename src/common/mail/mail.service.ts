import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";  
import { getEmailHtml } from "../public"; 
import { REDIS_CLIENT } from "../../config/redis/redis.module"; 
import Redis from "ioredis"; 
import { generateOTP } from "../helper/otp-generator"; 
import { MailerService } from "@nestjs-modules/mailer";

@Injectable() 
export class MailService { 
  private readonly logger = new Logger(MailService.name); 

  constructor( 
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly mailerService: MailerService 
  ){} 

  private getOtpKey(email: string): string { 
    return `otp:${email.toLowerCase().trim()}`; 
  } 

  private async generateOtpCode(email: string): Promise<string> { 
    const code = generateOTP(); 
    const key = this.getOtpKey(email);
    
    await this.redis.set(key, code, 'EX', 300); 
    return code; 
  } 

  async sendOtp(to: string) { 
    const cleanEmail = to.toLowerCase().trim();
    const code: any = await this.generateOtpCode(cleanEmail); 

    try {
      const info = await this.mailerService.sendMail({ 
        from: '"My App" <xamzayevyashnar060@gmail.com>', 
        to: cleanEmail,
        subject: `${code} - tasdiqlash kodi`, 
        html: getEmailHtml(code) 
      }); 

      return { success: true, messageId: info.messageId }; 
    } catch (error) {
      const key = this.getOtpKey(cleanEmail);
      await this.redis.del(key); 
      
      this.logger.error('Emailga OTP kod yuborilmadi', error); 
      throw new InternalServerErrorException('Kod yuborilishida xatolik yuz berdi'); 
    }
  } 

  async verifyOtp(to: string, code: string) { 
    const key = this.getOtpKey(to); 
    const stored = await this.redis.get(key); 

    if (!stored) { 
      throw new BadRequestException('Email topilmadi, kod muddati tugagan yoki avval so‘ralmagan'); 
    } 

    if (stored !== code.trim()) { 
      throw new BadRequestException('Noto‘g‘ri kod kiritildi'); 
    } 

    await this.redis.del(key); 

    return { verified: true }; 
  } 
}
