import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Script } from './entities/script.entity';
import { Between, DataSource, In, Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { handleDBErrors } from 'src/utils';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ChangePositionContentDto } from './dto/change-position-content.dto';
import { format, addMonths, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class ScriptsService {
  constructor(
    @InjectRepository(Script)
    private readonly scriptRepository: Repository<Script>,

    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,

    private readonly dataSource: DataSource,
  ) { }

  async create(createScriptDto: CreateScriptDto, user: User) {
    try {
      const script = this.scriptRepository.create({
        ...createScriptDto,
        user
      })
      await this.scriptRepository.save(script);

      return script;

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async createContent(createContentDto: CreateContentDto, user: User) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { script, position, ...contentDetails } = createContentDto;

    if (!contentDetails.textContent) contentDetails.textContent = 'Sin Contenido';

    if (user.role.permissions.includes('admin_user') && script !== null) {
      contentDetails.status = true;
    }

    let scriptDB;
    if (script !== null) {
      scriptDB = await this.findOne(script);
    }

    const lastContent = await this.findLastContentInScript(script);

    try {
      const content = await this.contentRepository.create({
        ...contentDetails,
        position: lastContent,
        user,
        script: script !== null ? scriptDB : script,
      });
      await queryRunner.manager.save(content);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return content;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      handleDBErrors(error, 'scripts');
    }
  }


  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const scripts = await this.scriptRepository.find({
        take: limit,
        skip: offset,
        where: {
          isDeleted: false,
        },
        relations: {
          contents: {
            user: true,
            contentsFiles: true,
          },
          user: true,
        },
        order: {
          id: 'DESC',
        }
      });

      return scripts;

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async findAllContents(user: User) {
    try {
      if (user.role.name === 'JEFE DEL DEPARTAMENTO DE NOTICIAS' || user.role.name === 'AUXILIAR DE INFORMÁTICA') {
        return await this.contentRepository.find({
          where: {
            isDeleted: false,
            type: 'Nota',
          },
          relations: {
            script: {
              user: true,
            },
            user: true,
            contentsFiles: true,
          },
          order: {
            id: 'DESC',
          },
        });
      }

      return await this.contentRepository.find({
        where: {
          isDeleted: false,
          type: 'Nota',
          status: true,
        },
        relations: {
          script: {
            user: true,
          },
          user: true,
          contentsFiles: true,
        },
        order: {
          id: 'DESC',
        },
      });


    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async findAllContentsForUser(user: User) {
    try {
      const contents = await this.contentRepository.find({
        where: {
          user,
          isDeleted: false,
        },
        relations: {
          script: true,
          contentsFiles: true,
        },
      });

      return contents;

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async findAllContentsForScript(idScript: number) {
    await this.findOne(idScript);

    try {
      const contents = await this.contentRepository.find({
        where: {
          isDeleted: false,
          script: { id: idScript },
        },
        relations: {
          script: {
            user: true,
          },
          user: true,
          contentsFiles: true,
        },
        order: {
          position: 'ASC', // Ordenar de menor a mayor
        },
      });

      return contents;

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async findAllNewsLettersForPeriod(period: number) {
    try {
      const currentYear = new Date().getFullYear();

      // Definir rango de fechas según el trimestre
      const startMonth = (period - 1) * 3; // 0, 3, 6, 9
      const startDate = new Date(currentYear, startMonth, 1);
      const endDate = new Date(currentYear, startMonth + 3, 0); // Último día del mes final

      const newsLetters = await this.contentRepository.find({
        where: {
          isDeleted: false,
          classification: 'Boletín',
          createdAt: Between(startDate, endDate),
        },
        relations: {
          user: true,
        },
        order: {
          id: 'DESC',
        },
      });

      return newsLetters;

    } catch (error) {
      handleDBErrors(error, 'findAllNewsLettersForPeriod - content');
    }
  }


  async findOne(id: number) {
    const script = await this.scriptRepository.findOne({
      where: { id, isDeleted: false },
      relations: { contents: { user: true, contentsFiles: true }, user: true },
    });
    if (!script) throw new NotFoundException(`Script with id: ${id} not found`);

    return script;
  }

  async findOneWithContentApproved(id: number) {
    const script = await this.findOne(id);
    return script.contents
      .filter(content => content.status && !content.isDeleted)
      .sort((a, b) => a.position! - b.position!);
  }

  async findOneWithContentDisapproved() {
    try {
      const contents = await this.contentRepository.find({
        where: {
          isDeleted: false,
          status: false,
        },
        relations: {
          user: true,
          contentsFiles: true,
        },
      });

      return contents;

    } catch (error) {
      handleDBErrors(error, 'script');
    }
  }

  async findOneContent(id: number) {
    const content = await this.contentRepository.findOne({
      where: { id, isDeleted: false },
      relations: { script: { user: true }, user: true, contentsFiles: true },
    });
    if (!content) throw new NotFoundException(`Content with id: ${id} not found`);

    return content;
  }

  async findLastContentInScript(id: number) {
    const content = await this.contentRepository.findOne({
      where: {
        script: {
          id: id,
        },
        isDeleted: false,
      },
      order: { position: 'DESC' },
    });
    if (!content) return 0;

    return content.position! + 1;
  }

  async update(id: number, updateScriptDto: UpdateScriptDto) {
    const script = await this.findOne(id);

    try {
      Object.assign(script, updateScriptDto);
      await this.scriptRepository.save(script);

      return this.findOne(id);

    } catch (error) {
      handleDBErrors(error, 'scripts')
    }
  }

  async updateContent(id: number, updateContentDto: UpdateContentDto, user: User) {
    const content = await this.findOneContent(id);

    if (updateContentDto.script) {
      await this.findOne(updateContentDto.script);
    }

    try {
      Object.assign(content, updateContentDto);
      await this.contentRepository.save(content);

      return this.findOneContent(id);

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async changePositionContent(id: number, changePositionContent: ChangePositionContentDto) {
    const content = await this.findOneContent(id);

    try {
      Object.assign(content, { position: changePositionContent.position });
      await this.contentRepository.save(content);

      return this.findOneContent(id);

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

  async countContentsByDateRange(startDate: Date, endDate: Date) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('content.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('content.isDeleted = false')
      .andWhere('content.classification != :excludedClassification', { excludedClassification: 'Menciones' })
      .limit(700)
      .getMany();

    const total = contents.length;

    const monthlyMap = new Map<string, {
      propios: { count: number, contents: Content[] },
      coproducidos: { count: number, contents: Content[] }
    }>();

    let totalPropios = 0;
    let totalCoproducidos = 0;

    for (const content of contents) {
      const monthKey = format(new Date(content.createdAt), 'yyyy-MM');

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          propios: { count: 0, contents: [] },
          coproducidos: { count: 0, contents: [] },
        });
      }

      const monthData = monthlyMap.get(monthKey)!;

      if (content.classification === 'Contenido General') {
        monthData.propios.count += 1;
        monthData.propios.contents.push(content);
        totalPropios += 1;
      }

      if (['Boletín', 'Editoriales'].includes(content.classification)) {
        monthData.coproducidos.count += 1;
        monthData.coproducidos.contents.push(content);
        totalCoproducidos += 1;
      }
    }

    const months: {
      month: string;
      propios: { count: number, contents: Content[] };
      coproducidos: { count: number, contents: Content[] };
      subtotal: number;
    }[] = [];

    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const key = format(current, 'yyyy-MM');
      const name = format(current, 'MMMM', { locale: es });
      const data = monthlyMap.get(key) || {
        propios: { count: 0, contents: [] },
        coproducidos: { count: 0, contents: [] },
      };

      months.push({
        month: name.charAt(0).toUpperCase() + name.slice(1),
        propios: data.propios,
        coproducidos: data.coproducidos,
        subtotal: data.propios.count + data.coproducidos.count,
      });

      current = addMonths(current, 1);
    }

    return {
      total,
      totalPropios,
      totalCoproducidos,
      months,
    };
  }


  async getWeeklyReport() {
    const today = new Date()
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes

    return this.countContentsByDateRange(startOfWeek, today);
  }

  async getBiweeklyReport() {
    const today = new Date();
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 14);

    return this.countContentsByDateRange(fifteenDaysAgo, today);
  }

  async getMonthlyReport() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return this.countContentsByDateRange(startOfMonth, today);
  }

  async getBimonthlyReport() {
    const today = new Date();
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    return this.countContentsByDateRange(twoMonthsAgo, today);
  }

  async getTrimestralReport() {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    return this.countContentsByDateRange(threeMonthsAgo, today);
  }

  async getSemiannualReport() {
    const today = new Date();
    const sixMonthAgo = new Date(today);
    sixMonthAgo.setMonth(today.getMonth() - 6);

    return this.countContentsByDateRange(sixMonthAgo, today);
  }

  async getAnnualReport() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return this.countContentsByDateRange(startOfYear, today);
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.findOne(id);

    try {

      await queryRunner.manager.update(Script, { id }, { isDeleted: true });
      await queryRunner.manager.update(Content, { script: id }, { isDeleted: true });


      await queryRunner.commitTransaction();
      await queryRunner.release();

      return {
        message: `Script with id: ${id} is removed successfully`,
      }

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      handleDBErrors(error, 'scripts');
    }
  }

  async removeContent(id: number) {
    await this.findOneContent(id);

    try {
      await this.contentRepository.update(id, { isDeleted: true });

      return {
        message: `Content with id: ${id} is removed successfully`,
      }

    } catch (error) {
      handleDBErrors(error, 'scripts');
    }
  }

}
