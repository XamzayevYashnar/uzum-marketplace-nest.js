import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/verify-otp-dto";

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
}