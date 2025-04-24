import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/auth/decorators';
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @Auth( ValidPermissions.create_content )
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadToDrive(file);
  }

  @Get(':id')
  @Auth( ValidPermissions.view_content )
  findOne(@Param('id') fileId: string) {
    return this.filesService.getFileById(fileId);
  }
}
