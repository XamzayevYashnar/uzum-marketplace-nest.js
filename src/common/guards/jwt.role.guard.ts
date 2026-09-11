import { ExecutionContext, CanActivate, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()   
export class RolesGuard implements CanActivate {

    constructor (private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean {
        const requireRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(), 
            context.getClass()
        ]);

        if (!requireRoles) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user; 

        if (!user) {
            throw new UnauthorizedException("User is not found");
        }

        const hasRole = requireRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException("You do not have permission to access this resource");
        }

        return true;
    }
}
