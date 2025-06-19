import { IsNumber, Min } from 'class-validator';

export class AddContentDto {
  @IsNumber()
  @Min(1)
  contentId: number;
} 