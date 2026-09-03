import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/verify-otp-dto";
import { GetRefreshToken } from "../../common/decorator/getRefreshToken";
import { CreateAdminDto } from "../../common/types/admin/create-admin-dto";
import { JwtAuthGuard } from "../../common/jwt/jwt.auth.guard";
import { RolesGuard } from "../../common/jwt/jwt.role.guard";
import { AccessRoles } from "../../common/decorator/roles.decorator";
import { Roles } from "../../../generated/prisma/enums";

@Controller('admin')
export class AdminController {
    constructor (
        private readonly adminService: AdminService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto){
        return this.adminService.signIn(dto)
    }

    @Post('verify/otp')
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.adminService.verifyOtp(dto, res)
    }

    @Get('users')
    getAllUsers(){
        return this.adminService.getAllUsers()
    }

    @Post('refresh')
    refreshToken(@GetRefreshToken() token: string){
        return this.adminService.refreshToken(token)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @AccessRoles(Roles.SUPER_ADMIN)
    @Post('create/admin')
    async createAdmin(@Body() dto: CreateAdminDto){
        return this.adminService.createAdmin(dto)
    }
}