import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [PrismaModule, AdminModule],
})
export class AppModule {}
