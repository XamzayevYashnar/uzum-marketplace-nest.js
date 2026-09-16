import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Req, 
  Res, 
  UploadedFile, 
  UseGuards, 
  UseInterceptors, 
  ParseIntPipe, 
  Ip,
  Delete
} from "@nestjs/common"; 
import { AdminService } from "./admin.service"; 
import { SignInDto } from "../../common/dto/auth/sign-in-dto"; 
import { VerifyOtpDto } from "../../common/dto/auth/verify-otp-dto"; 
import { CreateAdminDto } from "../../common/dto/admin/create-admin-dto"; 
import { UpdateAdminDto } from "../../common/dto/admin/update-admin-dto"; 
import { GetRefreshToken } from "../../common/decorator/custom/getRefreshToken"; 
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard"; 
import { RolesGuard } from "../../common/guards/jwt.role.guard"; 
import { JwtParamGuard } from "../../common/guards/jwt.param.guard"; 
import { AccessRoles } from "../../common/decorator/meta/roles.decorator"; 
import { Roles } from "../../../generated/prisma/enums"; 
import { FileInterceptor } from "@nestjs/platform-express"; 
import { ImageValidationPipe } from "../../common/pipe/image.validation.pipe"; 
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"; 
import type { Request, Response } from "express"; 
import "multer"; 

@ApiTags('admin') 
@Controller('admin') 
export class AdminController { 
  constructor(private readonly adminService: AdminService) {} 

  @Post('sign/in') 
  @ApiOperation({ summary: "Login system" }) 
  @ApiResponse({ status: 200, description: "The OTP code has been successfully sent to email" }) 
  signIn(@Body() dto: SignInDto) { 
    return this.adminService.signIn(dto); 
  } 

  @Post('verify/otp') 
  @ApiOperation({ summary: "Verify Email code" }) 
  @ApiResponse({ status: 201, description: "Tokens successfully created" }) 
  verifyOtp(
    @Body() dto: VerifyOtpDto, 
    @Res({ passthrough: true }) res: Response,  
    @Req() req: Request, 
    @Ip() ip: string
  ) { 
    return this.adminService.verifyOtp(dto, res, req, ip); 
  } 

  @Post("sign/out")
  @ApiOperation({ summary: "Sign out from system" })
  async signOut(@GetRefreshToken() token: string, @Res({ passthrough: true }) res: Response) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    await this.adminService.signOut(token);

    return { success: true, message: "Muvaffqiyatli chiqdingiz" };
  }

  @Get() 
  @ApiCookieAuth() 
  @AccessRoles(Roles.SUPER_ADMIN) 
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @ApiOperation({ summary: "Get Users List" }) 
  @ApiResponse({ status: 200, description: "Admins List" }) 
  getAllUsers() { 
    return this.adminService.getAllUsers(); 
  } 

  @Post('refresh') 
  @ApiOperation({ summary: "Refresh access token using Refresh Token" }) 
  @ApiResponse({ status: 201, description: "Access token successfully updated" }) 
  refreshToken(@GetRefreshToken() token: string, @Res({ passthrough: true }) res: Response) { 
    return this.adminService.refreshToken(token, res); 
  } 

  @Post('create') 
  @ApiCookieAuth() 
  @AccessRoles(Roles.SUPER_ADMIN) 
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @UseInterceptors(FileInterceptor('avatar')) 
  @ApiOperation({ summary: "Create Admin (SUPER_ADMIN only)" }) 
  @ApiResponse({ status: 201, description: "Admin successfully created" }) 
  async createAdmin( 
    @Body() dto: CreateAdminDto, 
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File 
  ) { 
    return this.adminService.createAdmin(dto, file); 
  } 

  @Get(':id') 
  @ApiCookieAuth() 
  @UseGuards(JwtAuthGuard, JwtParamGuard) 
  @ApiOperation({ summary: "Get single admin by ID" }) 
  @ApiResponse({ status: 200, description: "User exists" }) 
  findOneUser(@Param("id", ParseIntPipe) id: number) { 
    return this.adminService.findOneUser(id); 
  } 

  @Post("update") 
  @ApiCookieAuth() 
  @AccessRoles(Roles.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @UseInterceptors(FileInterceptor('avatar')) 
  @ApiOperation({ summary: "Update Admin data" }) 
  @ApiResponse({ status: 200, description: "Admin successfully updated" }) 
  update( 
    @Body() dto: UpdateAdminDto, 
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File 
  ) { 
    return this.adminService.update(dto, file); 
  } 
}
