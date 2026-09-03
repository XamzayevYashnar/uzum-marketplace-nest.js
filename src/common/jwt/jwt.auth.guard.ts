import { ExecutionContext, UnauthorizedException, CanActivate } from "@nestjs/common";
import { Token } from "../../infrastructure/lib/Token";

export class JwtAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext){
        const req = context.switchToHttp().getRequest();

        const accessToken = req.cookies?.['accessToken'] || req['accessToken']?.['accessToken'];

        if (!accessToken){
            throw new UnauthorizedException("Please login before sending this request!");
        }

        try {
            const payload = await Token.verifyAccess(accessToken);

            req.user = {
                sub: payload.id,
                role: payload.role,
                status: payload.status
            }

            return true
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}