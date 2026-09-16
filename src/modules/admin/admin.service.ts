import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { AuthService } from "../../common/services/base.service";
import { PrismaService } from "../../config/database/prisma.service";
import { MailService } from "../../common/mail/mail.service";
import { CreateAdminDto } from "../../common/dto/admin/create-admin-dto";
import { Crypt } from "../../infrastructure/lib/Crypt";
import { Roles, Status } from "../../../generated/prisma/enums";
import { uploadFile } from "../../infrastructure/lib/Upload";
import { UpdateAdminDto } from "../../common/dto/admin/update-admin-dto";

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
        sessions: true,
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

  async createAdmin(dto: CreateAdminDto, file?: any){
    await this.isDuplicateEmail(dto.email);

    const { password, ...res } = dto;

    const hashedPassword = await Crypt.hash(password);

    let uploadImageUrl = dto.imageUrl;

    if (file){
      const uploadResult = await uploadFile(file);

      if (uploadResult.success || uploadResult.url){
        uploadImageUrl = uploadResult.url;
      } else {
        throw new Error("Can't save avatar");
      }
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...res,
        hashedPassword,
        imageUrl: uploadImageUrl,
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

  async findOneUser(id: number){
    return await this.prisma.user.findUnique({
      where: { id: id }
    } as any)
  }

  async update(dto: UpdateAdminDto, file: any){}

  async deleteSession(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      throw new NotFoundException("This session is not found"); 
    }

    return this.prisma.session.delete({
      where: { id }
    });
  }

}