import { SetMetadata } from "@nestjs/common";

export const AccessRoles = (...res: string[]) => SetMetadata('roles', res);