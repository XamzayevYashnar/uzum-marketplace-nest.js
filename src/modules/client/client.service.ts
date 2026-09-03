import { Injectable } from "@nestjs/common";
import { AuthService } from "../../common/service/base.service";
import { PrismaService } from "../../config/database/prisma.service";
import { MailService } from "../../common/mail/mail.service";

@Injectable() 
export class ClientService extends AuthService {
  constructor(private readonly prismaService: PrismaService, private mailService: MailService) {
    super(prismaService, 'client', mailService);
  }
}
