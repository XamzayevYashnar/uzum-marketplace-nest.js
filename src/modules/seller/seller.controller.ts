import { Body, Controller, Post, Res } from "@nestjs/common";
import { SignInDto } from "../../common/dto/auth/sign-in-dto";
import type { Response } from "express";
import { VerifyOtpDto } from "../../common/dto/auth/verify-otp-dto";
import { SignUpDto } from "../../common/dto/auth/sign-up-dto";
import { SellerService } from "./seller.service";
import { GetRefreshToken } from "../../common/decorator/custom/getRefreshToken";

@Controller('client')
export class SellerController {
    constructor (
        private readonly sellerService: SellerService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto){
        return this.sellerService.signIn(dto)
    }

    @Post('verify/otp')
    verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response){
        return this.sellerService.verifyOtp(dto, res)
    }

    @Post('sign/up')
    signUp(@Body() dto: SignUpDto){
        return this.sellerService.signUp(dto)
    }

    @Post('refresh')
    refreshToken(@GetRefreshToken() token: string){
        return this.sellerService.refreshToken(token)
    }
}