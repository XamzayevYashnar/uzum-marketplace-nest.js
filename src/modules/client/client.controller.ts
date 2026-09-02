import { Body, Controller, Post, Res } from "@nestjs/common";
import { ClientService } from "./client.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/verify-otp-dto";
import { SignUpDto } from "../../common/types/sign-up-dto";
import { GetRefreshToken } from "../../common/decorator/getRefreshToken";

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
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.clientService.verifyOtp(dto, res)
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