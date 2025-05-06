import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post()
  @Auth(ValidPermissions.create_newsletter)
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newslettersService.create(createNewsletterDto);
  }

  @Get()
  @Auth(ValidPermissions.view_newsletters)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.newslettersService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth(ValidPermissions.view_newsletter)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newslettersService.findOne(+id);
  }

  @Patch(':id')
  @Auth(ValidPermissions.update_newsletter)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update(+id, updateNewsletterDto);
  }

  @Delete(':id')
  @Auth(ValidPermissions.delete_newsletter)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newslettersService.remove(+id);
  }
}
