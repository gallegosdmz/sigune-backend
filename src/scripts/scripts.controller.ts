import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ValidPermissions } from 'src/auth/interfaces';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ChangePositionContentDto } from './dto/change-position-content.dto';
import { GetContentsByDateDto } from './dto/get-report-contents.dto';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  @Auth( ValidPermissions.create_script )
  create(
    @Body() createScriptDto: CreateScriptDto,
    @GetUser() user: User
  ) {
    return this.scriptsService.create( createScriptDto, user );
  }

  @Post('content')
  @Auth( ValidPermissions.create_content )
  createContent(
    @Body() createContentDto: CreateContentDto,
    @GetUser() user: User
  ) {
    return this.scriptsService.createContent( createContentDto, user )
  }

  @Post('count-contents-by-date')
  @Auth(ValidPermissions.admin_user)
  findCountContentsByDate(
    @Body() getContentsByDateDto: GetContentsByDateDto
  ) {
    return this.scriptsService.countContentsByDateRange(getContentsByDateDto.startDate, getContentsByDateDto.endDate);
  }

  @Get()
  @Auth( ValidPermissions.view_scripts )
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.scriptsService.findAll( paginationDto );
  }

  @Get('contents')
  @Auth( ValidPermissions.view_contents )
  findAllContents() {
    return this.scriptsService.findAllContents();
  }
  
  @Get('contents-for-user')
  @Auth( ValidPermissions.view_contents )
  findAllContentsForUser(
    @GetUser() user: User
  ) {
    return this.scriptsService.findAllContentsForUser( user );
  }

  @Get('withContentDisapproved')
  @Auth( ValidPermissions.view_script )
  findOneWithContentDisapproved() {
    return this.scriptsService.findOneWithContentDisapproved();
  }

  @Get('weekly-contents')
  @Auth( ValidPermissions.admin_user )
  findWeeklyReport() {
    return this.scriptsService.getWeeklyReport();
  }

  @Get('biweekly-contents')
  @Auth( ValidPermissions.admin_user )
  findBiweeklyReport() {
    return this.scriptsService.getBiweeklyReport();
  }

  @Get('monthly-contents')
  @Auth( ValidPermissions.admin_user )
  findMonthlyReport() {
    return this.scriptsService.getMonthlyReport();
  }

  @Get('bimonthly-contents')
  @Auth( ValidPermissions.admin_user )
  findBimonthlyReport() {
    return this.scriptsService.getBimonthlyReport();
  }

  @Get('trimestral-contents')
  @Auth( ValidPermissions.admin_user )
  findTrimestralReport() {
    return this.scriptsService.getTrimestralReport();
  }

  @Get('semiannual-contents')
  @Auth( ValidPermissions.admin_user )
  findSemiannualReport() {
    return this.scriptsService.getSemiannualReport();
  }

  @Get('annual-contents')
  @Auth( ValidPermissions.admin_user )
  findAnnualReport() {
    return this.scriptsService.getAnnualReport();
  }

  @Get('contents-for-script/:id')
  @Auth( ValidPermissions.view_contents )
  findAllContentsForScript(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.findAllContentsForScript( id );
  }

  @Get('newsletters-for-period/:period')
  @Auth(ValidPermissions.view_content)
  findAllNewsLettersForScript(
    @Param('period', ParseIntPipe) period: number
  ) {
    return this.scriptsService.findAllNewsLettersForPeriod(period);
  }

  @Get(':id')
  @Auth( ValidPermissions.view_script )
  findOne(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.findOne(+id);
  }

  @Get('withContentApproved/:id')
  @Auth( ValidPermissions.view_script )
  findOneWithContentApproved(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.findOneWithContentApproved( +id );
  }

  @Get('content/:id')
  @Auth( ValidPermissions.view_content )
  findOneContent(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.findOneContent( +id );
  }

  @Patch(':id')
  @Auth( ValidPermissions.update_script )
  update(
    @Param('id', ParseIntPipe ) id: number,
    @Body() updateScriptDto: UpdateScriptDto
  ) {
    return this.scriptsService.update(+id, updateScriptDto);
  }

  @Patch('content/update/:id')
  @Auth( ValidPermissions.update_content )
  updateContent(
    @Param('id', ParseIntPipe ) id: number,
    @GetUser() user: User,
    @Body() updateContentDto: UpdateContentDto
  ) {
    return this.scriptsService.updateContent( +id, updateContentDto, user );
  }

  @Patch('content/change-position/:id')
  @Auth( ValidPermissions.update_content )
  changePositionContent(
    @Param('id', ParseIntPipe ) id: number,
    @Body() changePositionContentDto: ChangePositionContentDto
  ) {
    return this.scriptsService.changePositionContent( +id, changePositionContentDto );
  }

  @Delete(':id')
  @Auth( ValidPermissions.delete_script )
  remove(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.remove(+id);
  }

  @Delete('content/delete/:id')
  @Auth( ValidPermissions.delete_content )
  removeContent(
    @Param('id', ParseIntPipe ) id: number
  ) {
    return this.scriptsService.removeContent( +id );
  }

}
