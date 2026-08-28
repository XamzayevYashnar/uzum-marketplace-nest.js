import { Body, Controller, Post, Res } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";

@Controller('admin')
export class AdminController {
    constructor (
        private readonly adminService: AdminService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response){
        return this.adminService.signIn(dto, res)
    }
}