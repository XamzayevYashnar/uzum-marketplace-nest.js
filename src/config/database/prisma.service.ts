import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Status } from '../../../generated/prisma/client';
import { env } from '../index';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { Roles } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.DB_URI,
    });
    super({
      adapter,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    const superAdmin = await this.user.findUnique({ where: { email: env.SUPERADMIN.email } });

    if (!superAdmin){

      const { password, ...res } = env.SUPERADMIN;
      const hashedPassword = await Crypt.hash(password);

      const newUser = await this.user.create({
        data: {
          ...res,
          hashedPassword
        } as any
      })

      await this.admin.create({ 
        data: {
          userId: newUser.id,
          role: Roles.SUPER_ADMIN as any,
          status: Status.ACTIVE,
        }
       });

      this.logger.log(`New SuperAdmin 👤: \n ${JSON.stringify(newUser, null, 2)}`);

    }

    this.logger.log(`SuperAdmin is here 👤: \n ${JSON.stringify(superAdmin, null, 2)}`);

    this.logger.log("Database connected")
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
