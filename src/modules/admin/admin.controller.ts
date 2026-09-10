import { Body, Controller, Get, Param, Post, Res, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/types/auth/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/auth/verify-otp-dto";
import { GetRefreshToken } from "../../common/decorator/getRefreshToken";
import { CreateAdminDto } from "../../common/types/admin/create-admin-dto";
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard";
import { RolesGuard } from "../../common/guards/jwt.role.guard";
import { AccessRoles } from "../../common/decorator/roles.decorator";
import { Roles } from "../../../generated/prisma/enums";
import { ParseIntPipe } from "@nestjs/common";
import { JwtParamGuard } from "../../common/guards/jwt.param.guard";

@Controller('admin')
export class AdminController {
    constructor (
        private readonly adminService: AdminService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto){
        return this.adminService.signIn(dto);
    }

    @Post('verify/otp')
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.adminService.verifyOtp(dto, res);
    }

    @Get()
    getAllUsers(){
        return this.adminService.getAllUsers();
    }   

    @Post('refresh')
    refreshToken(@GetRefreshToken() token: string){
        return this.adminService.refreshToken(token);
    }

    @AccessRoles(Roles.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('create')
    async createAdmin(@Body() dto: CreateAdminDto){
        return this.adminService.createAdmin(dto);
    }

    @Get(':id')
    @AccessRoles(Roles.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, JwtParamGuard)
    findOneUser(@Param("id", ParseIntPipe) id: number){
        return this.adminService.findOneUser(id);
    }
}