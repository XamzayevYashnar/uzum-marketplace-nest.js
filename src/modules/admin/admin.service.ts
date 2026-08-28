import { Injectable } from "@nestjs/common";
import { AuthService } from "../../common/service/base.service";
import { PrismaService } from "../../config/database/prisma.service";

@Injectable() 
export class AdminService extends AuthService {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'admin');
  }
}
