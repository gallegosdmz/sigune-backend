import { IsArray, IsNumber, IsObject, IsString, Min, MaxLength, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class NewContentDataDto {
  @IsString()
  @MaxLength(20)
  type: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(50)
  head: string;

  @IsString()
  textContent: string;

  @IsString()
  classification: string;

  @IsString()
  @MaxLength(150)
  @IsOptional()
  dependence?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class MergeContentsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  contentIdsToRemove: number[];

  @IsObject()
  newContentData: NewContentDataDto;
} 