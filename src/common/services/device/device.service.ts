import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../config/database/prisma.service";

@Injectable()
export class DeviceService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async findAllDevices(userId: number){
        return await this.prisma.session.findMany({
            where: { userId: userId }
        })
    }

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