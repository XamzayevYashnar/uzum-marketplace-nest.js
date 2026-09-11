import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";
import type { AllowedModels } from "../enum";
import { Crypt } from "../../infrastructure/lib/Crypt";

@Injectable()
export class MainService {
    constructor( 
        protected readonly prisma: PrismaService, 
        protected readonly model: AllowedModels, 
    ) {} 

    public async validateModelAccess(userId: string) {
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
    
    public async isDuplicateEmail(email: string): Promise<void> { 
        const userExists = await this.prisma.user.findUnique({ where: { email } }); 
        if (userExists) { 
          throw new ConflictException("Ushbu email allaqachon ro'yxatdan o'tgan"); 
        } 
    } 
    
    public async checkEmailPassword(email: string, password: string) { 
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
}