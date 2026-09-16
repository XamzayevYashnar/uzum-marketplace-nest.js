import { Injectable } from "@nestjs/common";
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
}