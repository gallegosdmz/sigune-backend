import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDailySummaryDto } from './dto/create-daily-summary.dto';
import { UpdateDailySummaryDto } from './dto/update-daily-summary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DailySummary } from './entities/daily-summary.entity';
import { In, Repository } from 'typeorm';
import { Content } from 'src/scripts/entities/content.entity';
import { WeeklySummary } from 'src/weekly-summarys/entities/weekly-summary.entity';
import { handleDBErrors } from 'src/utils';
import { WeeklySummarysService } from 'src/weekly-summarys/weekly-summarys.service';

@Injectable()
export class DailySummaryService {
  constructor(
    @InjectRepository(DailySummary)
    private readonly dailySummaryRepository: Repository<DailySummary>,

    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,

    @InjectRepository(WeeklySummary)
    private readonly weeklySummaryRepository: Repository<WeeklySummary>,

    private readonly weeklySummaryService: WeeklySummarysService,
  ) {}

  async create(createDailySummaryDto: CreateDailySummaryDto) {
    const { date, contents: contentIds, weeklySummary: weeklySummaryId } = createDailySummaryDto;

    const contents = await this.contentRepository.find({
      where: { id: In(contentIds || []), isDeleted: false },
    });
    if (!contents ) throw new NotFoundException('Contents not found');

    const weeklySummary = await this.weeklySummaryService.findOne(weeklySummaryId);

    try {
      const summary = this.dailySummaryRepository.create({
        date,
        contents,
        weeklySummary,
      });
      await this.dailySummaryRepository.save(summary);

      

      return summary;

    } catch (error) {
      handleDBErrors(error, 'create - dailySummarys');
    }
  }

  async findAll() {
    try {
      return this.dailySummaryRepository.find({
        where: { isDeleted: false },
        relations: {
          contents: true,
          weeklySummary: true,
        },
      });

    } catch (error) {
      handleDBErrors(error, 'findAll - dailySummarys');
    }
  }

  async findOne(id: number) {
    const summary = await this.dailySummaryRepository.findOne({
      where: { id, isDeleted: false },
      relations: { contents: true, weeklySummary: true },
    });
    if (!summary) throw new NotFoundException(`Daily Summary with id: ${ id } not found`);

    return summary;
  }

  async update(id: number, updateDailySummaryDto: UpdateDailySummaryDto) {
    const summary = await this.findOne(id);

    try {
      if (updateDailySummaryDto.date) summary.date = updateDailySummaryDto.date;

      if (updateDailySummaryDto.contents) {
        summary.contents = await this.contentRepository.find({
          where: { id: In(updateDailySummaryDto.contents || []), isDeleted: false },
        });
      }
      
      // HACER BUSQUEDA CON SERVICE DE WEEKLY SUMMARY PARA ASIGNARLO AL OBJETO DE DAILY
      if (updateDailySummaryDto.weeklySummary) {
        const weeklySummary = await this.weeklySummaryService.findOne(updateDailySummaryDto.weeklySummary!);
        summary.weeklySummary = weeklySummary;
      }

      await this.dailySummaryRepository.save(summary);

      return this.findOne(id);

    } catch (error) {
      handleDBErrors(error, 'update - dailySummary');
    }
  }7

  async remove(id: number) {
    const summary = await this.findOne(id);

    try {
      await this.dailySummaryRepository.update(id, { isDeleted: true });

      return summary;

    } catch (error) {
      handleDBErrors(error, 'remove - dailySummary');
    }
  }

  async mergeContents(
    dailySummaryId: number,
    contentIdsToRemove: number[],
    newContentData: Partial<Content>
  ) {
    // Verificar que el daily summary existe
    const dailySummary = await this.findOne(dailySummaryId);
    
    // Verificar que todos los contents existen y pertenecen al daily summary
    const contentsToRemove = await this.contentRepository.find({
      where: { id: In(contentIdsToRemove), isDeleted: false },
      relations: { dailySummarys: true }
    });

    if (contentsToRemove.length !== contentIdsToRemove.length) {
      throw new NotFoundException('Some contents not found');
    }

    // Verificar que todos los contents pertenecen al daily summary
    const contentsNotInDailySummary = contentsToRemove.filter(content => 
      !content.dailySummarys?.some(ds => ds.id === dailySummaryId)
    );

    if (contentsNotInDailySummary.length > 0) {
      throw new NotFoundException('Some contents do not belong to this daily summary');
    }

    try {
      // Asegurar que todos los campos obligatorios estén presentes
      const contentDataToSave = {
        type: newContentData.type || 'Nota',
        title: newContentData.title || 'Resumen de contenidos',
        head: newContentData.head || 'Resumen generado automáticamente',
        textContent: newContentData.textContent || 'Sin contenido',
        classification: newContentData.classification || 'Contenido General',
        dependence: newContentData.dependence,
        //url: newContentData.url,
        position: newContentData.position,
        status: newContentData.status !== undefined ? newContentData.status : false,
        isDeleted: false
      };

      // Crear el nuevo content (resumen)
      const newContent = this.contentRepository.create(contentDataToSave);
      await this.contentRepository.save(newContent);

      // Eliminar las relaciones directamente de la tabla pivote
      await this.dailySummaryRepository
        .createQueryBuilder()
        .relation(DailySummary, "contents")
        .of(dailySummaryId)
        .remove(contentIdsToRemove);

      // Agregar la relación entre el nuevo content y el daily summary
      await this.dailySummaryRepository
        .createQueryBuilder()
        .relation(DailySummary, "contents")
        .of(dailySummaryId)
        .add(newContent);

      return {
        message: 'Contents merged successfully',
        removedContents: contentsToRemove,
        newContent: newContent,
        dailySummary: await this.findOne(dailySummaryId)
      };

    } catch (error) {
      handleDBErrors(error, 'mergeContents - dailySummary');
    }
  }

  async addContentToDailySummary(dailySummaryId: number, contentId: number) {
    // Verificar que el daily summary existe
    const dailySummary = await this.findOne(dailySummaryId);
    
    // Verificar que el content existe
    const content = await this.contentRepository.findOne({
      where: { id: contentId, isDeleted: false }
    });
    
    if (!content) {
      throw new NotFoundException(`Content with id: ${contentId} not found`);
    }

    // Verificar que la relación no existe ya
    const existingRelation = await this.dailySummaryRepository
      .createQueryBuilder('dailySummary')
      .leftJoin('dailySummary.contents', 'content')
      .where('dailySummary.id = :dailySummaryId', { dailySummaryId })
      .andWhere('content.id = :contentId', { contentId })
      .getOne();

    if (existingRelation) {
      throw new NotFoundException('This content is already associated with this daily summary');
    }

    try {
      // Agregar la relación usando QueryBuilder
      await this.dailySummaryRepository
        .createQueryBuilder()
        .relation(DailySummary, "contents")
        .of(dailySummaryId)
        .add(content);

      return {
        message: 'Content added to daily summary successfully',
        dailySummary: await this.findOne(dailySummaryId)
      };

    } catch (error) {
      handleDBErrors(error, 'addContentToDailySummary - dailySummary');
    }
  }

  async removeContentFromDailySummary(dailySummaryId: number, contentId: number) {
    // Verificar que el daily summary existe
    const dailySummary = await this.findOne(dailySummaryId);
    
    // Verificar que el content existe
    const content = await this.contentRepository.findOne({
      where: { id: contentId, isDeleted: false }
    });
    
    if (!content) {
      throw new NotFoundException(`Content with id: ${contentId} not found`);
    }

    // Verificar que la relación existe
    const existingRelation = await this.dailySummaryRepository
      .createQueryBuilder('dailySummary')
      .leftJoin('dailySummary.contents', 'content')
      .where('dailySummary.id = :dailySummaryId', { dailySummaryId })
      .andWhere('content.id = :contentId', { contentId })
      .getOne();

    if (!existingRelation) {
      throw new NotFoundException('This content is not associated with this daily summary');
    }

    try {
      // Eliminar la relación usando QueryBuilder
      await this.dailySummaryRepository
        .createQueryBuilder()
        .relation(DailySummary, "contents")
        .of(dailySummaryId)
        .remove(content);

      return {
        message: 'Content removed from daily summary successfully',
        dailySummary: await this.findOne(dailySummaryId)
      };

    } catch (error) {
      handleDBErrors(error, 'removeContentFromDailySummary - dailySummary');
    }
  }
}
