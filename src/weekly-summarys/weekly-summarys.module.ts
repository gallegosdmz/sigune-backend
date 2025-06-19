import { Module } from '@nestjs/common';
import { WeeklySummarysService } from './weekly-summarys.service';
import { WeeklySummarysController } from './weekly-summarys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklySummary } from './entities/weekly-summary.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [WeeklySummarysController],
  providers: [WeeklySummarysService],
  imports: [
    TypeOrmModule.forFeature([WeeklySummary]),
    AuthModule,
  ],
  exports: [WeeklySummarysService],
})
export class WeeklySummarysModule {}
