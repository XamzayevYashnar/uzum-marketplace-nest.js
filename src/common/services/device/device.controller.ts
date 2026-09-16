import { Controller, Get, UseGuards } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { CurrentUserId } from "../../decorator/custom/current-decorator";
import { JwtAuthGuard } from "../../guards/jwt.auth.guard";

@Controller('devices')
export class DeviceController {
    constructor (
        private readonly deviceService: DeviceService
    ){};    

    @Get()
    @UseGuards(JwtAuthGuard)
    findAllDevices(@CurrentUserId() userId: number){
        return this.deviceService.findAllDevices(userId);
    }
}