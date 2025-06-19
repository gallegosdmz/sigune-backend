import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeeklySummarysService } from './weekly-summarys.service';
import { CreateWeeklySummaryDto } from './dto/create-weekly-summary.dto';
import { UpdateWeeklySummaryDto } from './dto/update-weekly-summary.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('weekly-summarys')
export class WeeklySummarysController {
  constructor(private readonly weeklySummarysService: WeeklySummarysService) {}

  @Post()
  @Auth(ValidPermissions.create_script)
  create(@Body() createWeeklySummaryDto: CreateWeeklySummaryDto) {
    return this.weeklySummarysService.create(createWeeklySummaryDto);
  }

  @Get()
  @Auth(ValidPermissions.view_contents)
  findAll() {
    return this.weeklySummarysService.findAll();
  }

  @Get(':id')
  @Auth(ValidPermissions.view_content)
  findOne(@Param('id') id: string) {
    return this.weeklySummarysService.findOne(+id);
  }

  @Patch(':id')
  @Auth(ValidPermissions.update_script)
  update(@Param('id') id: string, @Body() updateWeeklySummaryDto: UpdateWeeklySummaryDto) {
    return this.weeklySummarysService.update(+id, updateWeeklySummaryDto);
  }

  @Delete(':id')
  @Auth(ValidPermissions.delete_script)
  remove(@Param('id') id: string) {
    return this.weeklySummarysService.remove(+id);
  }
}
