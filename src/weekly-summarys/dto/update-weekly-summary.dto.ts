import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklySummaryDto } from './create-weekly-summary.dto';

export class UpdateWeeklySummaryDto extends PartialType(CreateWeeklySummaryDto) {}
