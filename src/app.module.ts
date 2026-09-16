import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { MailModule } from './common/mail/mail.module';
import { RedisModule } from './config/redis/redis.module';
import { SellerModule } from './modules/seller/seller.module';
import { DeviceModule } from './common/services/device/device.module';

@Module({
  imports: [PrismaModule, AdminModule, ClientModule, MailModule, RedisModule, SellerModule, DeviceModule],
})
export class AppModule {}
