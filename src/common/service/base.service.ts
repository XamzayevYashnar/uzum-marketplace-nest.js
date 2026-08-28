import { PrismaService } from "../../config/database/prisma.service";

export class AuthService {
  constructor(
    protected readonly prisma: PrismaService, 
    protected readonly model: any,            
  ) {}
}