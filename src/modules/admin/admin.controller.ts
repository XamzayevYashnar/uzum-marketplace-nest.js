import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/dto/auth/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/dto/auth/verify-otp-dto";
import { GetRefreshToken } from "../../common/decorator/getRefreshToken";
import { CreateAdminDto } from "../../common/dto/admin/create-admin-dto";
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard";
import { RolesGuard } from "../../common/guards/jwt.role.guard";
import { AccessRoles } from "../../common/decorator/roles.decorator";
import { Roles } from "../../../generated/prisma/enums";
import { ParseIntPipe } from "@nestjs/common";
import { JwtParamGuard } from "../../common/guards/jwt.param.guard";
import { FileInterceptor } from "@nestjs/platform-express"; 
import "multer"
import { ImageValidationPipe } from "../../common/pipe/image.validation.pipe";
import { UpdateAdminDto } from "../../common/dto/admin/update-admin-dto";

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
    @AccessRoles(Roles.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @UseInterceptors(FileInterceptor('avatar')) 
    async createAdmin(
        @Body() dto: CreateAdminDto, 
        @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File 
    ){
        return this.adminService.createAdmin(dto, file); 
    }

    @Get(':id')
    @AccessRoles(Roles.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, JwtParamGuard)
    findOneUser(@Param("id", ParseIntPipe) id: number){
        return this.adminService.findOneUser(id);
    }

    @Post("update")
    @UseInterceptors()
    update(
        @Body() dto: UpdateAdminDto,
        @UploadedFile() file: Express.Multer.File 
    ){
        return this.adminService.update();
    }
}
