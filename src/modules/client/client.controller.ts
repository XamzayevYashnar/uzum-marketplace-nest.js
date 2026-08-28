import { Body, Controller, Post, Res } from "@nestjs/common";
import { ClientService } from "./client.service";
import { SignInDto } from "../../common/types/sign-in-dto";
import type { Response } from "express";

@Controller('client')
export class ClientController {
    constructor (
        private readonly clientService: ClientService
    ){}

    @Post('sign/in')
    signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response){
        return this.clientService.signIn(dto, res)
    }
}