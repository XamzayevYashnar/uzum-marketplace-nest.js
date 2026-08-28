import { env } from "../../config";
import * as jwt from "@nestjs/jwt";

export class Token {
    static jwt: jwt.JwtService;

    static ACCESS_SECRET_KEY = env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_KEY;
    static ACCESS_TOKEN_TIME = env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_TIME as any;

    static REFRESH_SECRET_KEY = env.JWT_TOKENS.REFRESH_TOKEN.REFRESH_TOKEN_KEY;
    static REFRESH_TOKEN_TIME = env.JWT_TOKENS.REFRESH_TOKEN.REFRESH_TOKEN_TIME as any;

    static async accessToken(payload: Record<string, any>) {
        return await Token.jwt.signAsync(payload, {
            secret: Token.ACCESS_SECRET_KEY,
            expiresIn: Token.ACCESS_TOKEN_TIME
        });
    }

    static async refreshToken(payload: Record<string, any>) {
        return await Token.jwt.signAsync(payload, {
            secret: Token.REFRESH_SECRET_KEY,
            expiresIn: Token.REFRESH_TOKEN_TIME
        });
    }
}
