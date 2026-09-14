import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { SignInDto } from "../../common/dto/auth/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/dto/auth/verify-otp-dto";
import { GetRefreshToken } from "../../common/decorator/custom/getRefreshToken";
import { CreateAdminDto } from "../../common/dto/admin/create-admin-dto";
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard";
import { RolesGuard } from "../../common/guards/jwt.role.guard";
import { AccessRoles } from "../../common/decorator/meta/roles.decorator";
import { Roles } from "../../../generated/prisma/enums";
import { ParseIntPipe } from "@nestjs/common";
import { JwtParamGuard } from "../../common/guards/jwt.param.guard";
import { FileInterceptor } from "@nestjs/platform-express"; 
import "multer"
import { ImageValidationPipe } from "../../common/pipe/image.validation.pipe";
import { UpdateAdminDto } from "../../common/dto/admin/update-admin-dto";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor (
        private readonly adminService: AdminService
    ){}

    @Post('sign/in')
    @ApiOperation({ summary: "Login system" })
    @ApiResponse({ status: 200, description: "The otp code is success send to email" })
    signIn(@Body() dto: SignInDto){
        return this.adminService.signIn(dto);
    }

    @Post('verify/otp')
    @ApiOperation({ summary: "Verify Email code" })
    @ApiResponse({ status: 201, description: "Tokens is success created" })
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.adminService.verifyOtp(dto, res);
    }

    @Get()
    @ApiCookieAuth()
    @AccessRoles(Roles.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: "Get Users List" })
    @ApiResponse({ status: 200, description: "Users List" })
    getAllUsers(){
        return this.adminService.getAllUsers();
    }   

    @Post('refresh')
    @ApiOperation({ summary: "Refresh you're accessToken with the help RefreshToken" })
    @ApiResponse({ status: 201, description: "AccessToken is success updated" })
    @ApiResponse({ status: 401, description: "UnAuthentication error, please Login before continue" })
    refreshToken(@GetRefreshToken() token: string){
        return this.adminService.refreshToken(token);
    }

    @Post('create')
    @ApiCookieAuth()
    @AccessRoles(Roles.SUPER_ADMIN)
    @ApiOperation({ summary: "Create Admin, only permission for SUPER_ADMIN" })
    @ApiResponse({ status: 201, description: "User is success created" })
    @ApiResponse({ status: 401, description: "Unauthorization exception, please singIn before continue" })
    @ApiResponse({ status: 403, description: "Forbidden exception, you haven't got permissions" })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('avatar')) 
    async createAdmin(
        @Body() dto: CreateAdminDto, 
        @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File 
    ){
        return this.adminService.createAdmin(dto, file); 
    }

    @Get(':id')
    @ApiCookieAuth()
    @ApiResponse({ status: 200, description: "User is exists" })
    @ApiResponse({ status: 404, description: "User is not found" })
    @ApiResponse({ status: 403, description: "You haven't got permission" })
    @ApiResponse({ status: 401, description: "Unauthorization exception, please singIn before continue" })
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
        return this.adminService.update(dto, file);
    }
}
