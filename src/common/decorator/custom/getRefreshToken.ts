import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const GetRefreshToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  
  const refreshToken = request.cookies?.['refreshToken'] || request['refreshTokens']?.['refreshToken'];

  if (!refreshToken) {
    throw new UnauthorizedException("Please log in before sending this request!");
  }
  
  return refreshToken;
});
