import { SetMetadata } from "@nestjs/common";
import { Roles } from "../../../../generated/prisma/enums";

export const AccessRoles = (...res: Roles[]) => SetMetadata('roles', res);