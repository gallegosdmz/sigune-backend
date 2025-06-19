import { PartialType } from '@nestjs/mapped-types';
import { CreateDailySummaryDto } from './create-daily-summary.dto';

export class UpdateDailySummaryDto extends PartialType(CreateDailySummaryDto) {}
