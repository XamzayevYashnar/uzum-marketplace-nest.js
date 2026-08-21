import { Module } from '@nestjs/common';
import { PrismaModule } from './config/database/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
