import { Body, Controller, Post, Res } from "@nestjs/common";
import { ClientService } from "./client.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/verify-otp-dto";

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
}