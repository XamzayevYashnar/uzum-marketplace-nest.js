import { Body, Controller, Post, Res } from "@nestjs/common";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/types/verify-otp-dto";
import { SignUpDto } from "../../common/types/sign-up-dto";
import { SellerService } from "./seller.service";

@Controller('client')
export class SellerController {
    constructor (
        private readonly SellerService: SellerService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto){
        return this.SellerService.signIn(dto)
    }

    @Post('verify/otp')
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.SellerService.verifyOtp(dto, res)
    }

    @Post('sign/up')
    signUp(@Body() dto: SignUpDto){
        return this.SellerService.signUp(dto)
    }
}