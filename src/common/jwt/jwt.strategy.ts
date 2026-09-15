import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { env } from "../../config"
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    let token = null;
                    if (req?.cookies?.accessToken) {
                        token = req.cookies.accessToken;
                    }

                    return token;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_KEY,
        });
    }

    async validate(payload: any){
        const userId = payload.sub ?? payload.id;

        const sessionExists = await this.prisma.session.findUnique({
            where: { id: payload.sessionId }
        });

        if (!sessionExists){
            throw new UnauthorizedException("Ushbu qurilma tizimdan chiqarib yuborilgan!");
        }

        return {
            id: userId,
            sub: userId,
            role: payload.role,
            status: payload.status,
            sessionId: payload.sessionId,
        }
    }
}   