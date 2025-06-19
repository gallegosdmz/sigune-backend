import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { CreateDailySummaryDto } from './dto/create-daily-summary.dto';
import { UpdateDailySummaryDto } from './dto/update-daily-summary.dto';
import { MergeContentsDto } from './dto/merge-contents.dto';
import { AddContentDto } from './dto/add-content.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('daily-summarys')
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  @Post()
  @Auth(ValidPermissions.create_script)
  create(@Body() createDailySummaryDto: CreateDailySummaryDto) {
    return this.dailySummaryService.create(createDailySummaryDto);
  }

  @Get()
  @Auth(ValidPermissions.view_contents)
  findAll() {
    return this.dailySummaryService.findAll();
  }

  @Get(':id')
  @Auth(ValidPermissions.view_content)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dailySummaryService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidPermissions.update_script)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDailySummaryDto: UpdateDailySummaryDto) {
    return this.dailySummaryService.update(id, updateDailySummaryDto);
  }

  @Delete(':id')
  @Auth(ValidPermissions.delete_script)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dailySummaryService.remove(id);
  }

  @Post(':id/merge-contents')
  @Auth(ValidPermissions.update_script)
  mergeContents(
    @Param('id', ParseIntPipe) id: number,
    @Body() mergeContentsDto: MergeContentsDto
  ) {
    return this.dailySummaryService.mergeContents(
      id,
      mergeContentsDto.contentIdsToRemove,
      mergeContentsDto.newContentData
    );
  }

  @Post(':id/add-content')
  @Auth(ValidPermissions.update_script)
  addContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() addContentDto: AddContentDto
  ) {
    return this.dailySummaryService.addContentToDailySummary(id, addContentDto.contentId);
  }

  @Delete(':id/remove-content/:contentId')
  @Auth(ValidPermissions.update_script)
  removeContent(
    @Param('id', ParseIntPipe) id: number,
    @Param('contentId', ParseIntPipe) contentId: number
  ) {
    return this.dailySummaryService.removeContentFromDailySummary(id, contentId);
  }
}
