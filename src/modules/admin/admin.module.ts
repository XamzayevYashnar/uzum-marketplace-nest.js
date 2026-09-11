import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { JwtStrategy } from "../../common/jwt/jwt.strategy";
import { env } from "../../config";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_KEY,
            signOptions: {
                expiresIn: env.JWT_TOKENS.ACCESS_TOKEN.ACCESS_TOKEN_TIME,
            },
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService, JwtStrategy],
    exports: [AdminService]
})
export class AdminModule {}