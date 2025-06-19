import { Module } from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { DailySummaryController } from './daily-summary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySummary } from './entities/daily-summary.entity';
import { Content } from 'src/scripts/entities/content.entity';
import { WeeklySummary } from 'src/weekly-summarys/entities/weekly-summary.entity';
import { WeeklySummarysModule } from 'src/weekly-summarys/weekly-summarys.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
  imports: [
    TypeOrmModule.forFeature([
      DailySummary,
      Content,
      WeeklySummary,
    ]),
    AuthModule,
    WeeklySummarysModule,
  ],
  exports: [DailySummaryService],
})
export class DailySummaryModule {}
