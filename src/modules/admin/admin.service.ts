import { Injectable } from "@nestjs/common";
import { AuthService } from "../../common/service/base.service";
import { PrismaService } from "../../config/database/prisma.service";
import { MailService } from "../../common/mail/mail.service";
import { CreateAdminDto } from "../../common/types/admin/create-admin-dto";
import { Crypt } from "../../infrastructure/lib/Crypt";
import { Roles, Status } from "../../../generated/prisma/enums";

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

  async createAdmin(dto: CreateAdminDto){
    await this.isDuplicateEmail(dto.email);

    const { password, ...res } = dto;

    const hashedPassword = await Crypt.hash(password);

    const newUser = await this.prisma.user.create({
      data: {
        ...res,
        hashedPassword
      }
    });

    await this.prisma.admin.create({
      data: {
        userId: newUser.id,
        role: Roles.ADMIN,
        status: Status.ACTIVE
      }
    });

    return {
      success: true,
      message: "Admin is success created"
    }
  }
  
}