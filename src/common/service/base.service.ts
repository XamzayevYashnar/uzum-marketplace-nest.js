import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";
import { SignInDto } from "../types/sign-in-dto";
import { Crypt } from "../../infrastructure/lib/Crypt";

@Injectable() 
export class AuthService {
  constructor(
    protected readonly prisma: PrismaService, 
    protected readonly model: string,
  ) {}

  async checkEmailPassword(email: string, password: string) {
    const userExists: any = await this.prisma.user.findUnique({ where: { email } });
    
    const isMatch = await Crypt.compare(password, userExists?.hashedPassword);

    if (!userExists || !isMatch) {
      throw new UnauthorizedException("Email or password is incorrect");
    }

    const modelExists = await (this.prisma as any)[this.model].findUnique({ 
      where: { id: userExists.id } 
    });

    if (!modelExists) {
      throw new ConflictException("You don't have permissions for this sub-system");
    }

    return {
      sub: userExists.id,
      role: modelExists.role,
      status: modelExists.status 
    };
  }

  async signIn(dto: SignInDto) {
    const payload = await this.checkEmailPassword(dto.email, dto.password);
    
    return {
      userId: payload.sub,
      role: payload.role,
    };
  } 
}
