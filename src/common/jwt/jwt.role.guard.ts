import { ExecutionContext, CanActivate, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()   
export class RolesGuard implements CanActivate {

    constructor (private readonly reflector: Reflector){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requireRoles = this.reflector.getAllAndOverride<string[]>(
            'roles', 
            [context.getHandler(), context.getClass()], 
        );

        if (!requireRoles){
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user){
            throw new ForbiddenException("User is not found");
        }

        const hasRole = requireRoles.includes(user.role);

        if (!hasRole){
            throw new ForbiddenException("User hasn't got permissions");
        }

        return true;
    }
}
