import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
@Module({
  imports: [PrismaModule, AdminModule, ClientModule],
})
export class AppModule {}
