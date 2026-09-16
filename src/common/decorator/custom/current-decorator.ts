import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const CurrentUserId = createParamDecorator((data: unknown, ctx: ExecutionContext)=>{
    const req = ctx.switchToHttp().getRequest();
    const userId = req.user?.sub;

    if (!userId){
        throw new UnauthorizedException("User is not found");
    }

    return userId
})