import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisModule } from './common/redis/redis.module';
@Module({
  imports: [PrismaModule, AdminModule, ClientModule, MailModule, RedisModule],
})
export class AppModule {}
