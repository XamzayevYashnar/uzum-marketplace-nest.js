import { Body, Controller, Ip, Post, Req, Res } from "@nestjs/common";
import { ClientService } from "./client.service";
import { SignInDto } from "../../common/dto/auth/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/dto/auth/verify-otp-dto";
import { SignUpDto } from "../../common/dto/auth/sign-up-dto";
import { GetRefreshToken } from "../../common/decorator/custom/getRefreshToken";
import type { Request } from "express"

@Controller('client')
export class ClientController {
    constructor (
        private readonly clientService: ClientService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto){
        return this.clientService.signIn(dto)
    }

    @Post('verify/otp')
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response, @Req() req: Request, @Ip() ip: any){
        return this.clientService.verifyOtp(dto, res, req, ip);
    }

    @Post('sign/up')
    signUp(@Body() dto: SignUpDto){
        return this.clientService.signUp(dto)
    }

    @Post('refresh')
    refreshToken(@GetRefreshToken() token: string){
        return this.clientService.refreshToken(token)
    }
}