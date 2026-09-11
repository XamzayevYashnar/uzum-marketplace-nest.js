import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { env } from "../../config"
import { Request } from "express";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(){
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

        return {
            id: userId,
            sub: userId,
            role: payload.role,
            status: payload.status,
        }
    }
}   