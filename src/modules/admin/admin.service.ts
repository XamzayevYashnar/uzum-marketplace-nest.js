import { Injectable } from "@nestjs/common";
import { AuthService } from "../../common/service/base.service";
import { PrismaService } from "../../config/database/prisma.service";
import { MailService } from "../mail/mail.service";

@Injectable() 
export class AdminService extends AuthService {
  constructor(private readonly prismaService: PrismaService, private mailService: MailService) {
    super(prismaService, 'admin', mailService);
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        admins: true,
        sellers: true,
        clients: true,
      },
    });

    return users.map((user) => {
      const formattedUser = { ...user } as any;

      if (formattedUser.admins?.length === 0) delete formattedUser.admins;
      if (formattedUser.sellers?.length === 0) delete formattedUser.sellers;
      if (formattedUser.clients?.length === 0) delete formattedUser.clients;

      return formattedUser;
    });
  }
  
}