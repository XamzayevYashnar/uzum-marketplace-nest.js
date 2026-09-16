import { JwtService } from "@nestjs/jwt";
import { env } from "../../config";
import type { Response } from "express";
import { IToken } from "../../common/interface/IToken.interface"

export class Token {
    private static readonly service = new JwtService();

    static accessToken(payload: Record<string, any>): Promise<string> {
        return Token.service.signAsync(payload, {
            secret: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_KEY,
            expiresIn: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_TIME,
        });
    }

    static refreshToken(payload: Record<string, any>): Promise<string> {
        return Token.service.signAsync(payload, {
            secret: env.JWT_TOKENS.REFRESH_TOKEN.REFRESH_TOKEN_KEY,
            expiresIn: env.JWT_TOKENS.REFRESH_TOKEN.REFRESH_TOKEN_TIME,
        });
    }

    static verifyAccess<T extends object = any>(token: string): Promise<T> {
        return Token.service.verifyAsync<T>(token, {
            secret: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_KEY,
        });
    }

    static verifyRefresh<T extends object = any>(token: string): Promise<T> {
        return Token.service.verifyAsync<T>(token, {
            secret: env.JWT_TOKENS.REFRESH_TOKEN.REFRESH_TOKEN_KEY,
        });
    }

    static async setCookie(res: Response, accessToken?: string, refreshToken?: string){

        if (refreshToken){
            res.cookie('refreshToken', refreshToken, { 
                httpOnly: true, 
                sameSite: 'lax', 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 7 * 24 * 60 * 60 * 1000 
            });
        }

        if (accessToken){
            res.cookie('accessToken', accessToken, { 
            httpOnly: true, 
            sameSite: 'lax', 
            secure: env.NODE_ENV === 'production', 
            maxAge: 15 * 60 * 1000
            }); 
        }
    }
}