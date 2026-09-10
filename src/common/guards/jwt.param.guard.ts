import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";

export class JwtParamGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const id = req.params;
        const user = req.user;

        if (user.role === "SUPER_ADMIN"){
            return true;
        }

        if (!id){
            throw new BadRequestException("Please send id in url");
        }

        if (user.sub !== id){
            throw new BadRequestException("Please enter only yourself id");
        }

        return true;
    }
}       