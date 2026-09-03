import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common"; 
import { Resend } from "resend"; 
import { env } from "../../config"; 
import { getEmailHtml } from "../public"; 
import { REDIS_CLIENT } from "../../config/redis/redis.module"; 
import Redis from "ioredis"; 
import { generateOTP } from "../helper/otp-generator"; 

@Injectable() 
export class MailService { 
  private readonly logger = new Logger(MailService.name); 
  private readonly resend = new Resend(env.RESEND.RESEND_API_KEY); 

  constructor( 
    @Inject(REDIS_CLIENT) private readonly redis: Redis, 
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

    const { data, error } = await this.resend.emails.send({ 
      from: "My App <onboarding@resend.dev>", 
      to: cleanEmail,
      subject: `${code} - tasdiqlash kodi`, 
      html: getEmailHtml(code) 
    }); 

    if (error) { 
      const key = this.getOtpKey(cleanEmail);
      await this.redis.del(key); 
      
      this.logger.error('Emailga OTP code yuborilmadi', error); 
      throw new InternalServerErrorException('Kod yuborilishida xatolik yuz berdi'); 
    } 

    return data; 
  } 

  async verifyOtp(to: string, code: string) { 
    const key = this.getOtpKey(to); 
    const stored = await this.redis.get(key); 

    if (!stored) { 
      throw new BadRequestException('Email is not found, please send code before continue'); 
    } 

    if (stored !== code) { 
      throw new BadRequestException('Incorrect code'); 
    } 

    await this.redis.del(key); 

    return { verified: true }; 
  } 
}
