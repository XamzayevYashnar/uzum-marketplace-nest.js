import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { CurrentUserId } from "../../decorator/custom/current-decorator";
import { JwtAuthGuard } from "../../guards/jwt.auth.guard";
import { ApiCookieAuth, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../guards/jwt.role.guard";
import { JwtParamGuard } from "../../guards/jwt.param.guard";

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

    @Delete("session/:id")
    @ApiCookieAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, JwtParamGuard)
    @ApiOperation({ summary: "Delete user session by Session ID" })
    deleteSession(@Param("id", ParseIntPipe) id: number) {
        return this.deviceService.deleteSession(id);
    }
}