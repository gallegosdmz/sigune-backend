import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWeeklySummaryDto } from './dto/create-weekly-summary.dto';
import { UpdateWeeklySummaryDto } from './dto/update-weekly-summary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WeeklySummary } from './entities/weekly-summary.entity';
import { Repository } from 'typeorm';
import { handleDBErrors } from 'src/utils';

@Injectable()
export class WeeklySummarysService {
  constructor(
    @InjectRepository(WeeklySummary)
    private readonly weeklySummaryRepository: Repository<WeeklySummary>,
  ) {}

  async create(createWeeklySummaryDto: CreateWeeklySummaryDto) {
    try {
      const weeklySummary = this.weeklySummaryRepository.create(
        createWeeklySummaryDto
      );
      await this.weeklySummaryRepository.save(weeklySummary);

      return weeklySummary;

    } catch (error) {
      handleDBErrors(error, 'create - weeklySummarys');
    }
  }

  async findAll() {
    try {
      return await this.weeklySummaryRepository.find({
        where: { isDeleted: false },
        relations: {
          dailySummarys: true,
        },
        order: {
          date: 'DESC'
        }
      });

    } catch (error) {
      handleDBErrors(error, 'findAll - dailySummarys');
    }
  }

  async findOne(id: number) {
    const weeklySummary = await this.weeklySummaryRepository.findOne({
      where: { id, isDeleted: false },
      relations: { dailySummarys: { contents: true } },
    });
    if (!weeklySummary) throw new NotFoundException(`Weelky Summary with id: ${ id } not found`);

    return weeklySummary;
  }

  async update(id: number, updateWeeklySummaryDto: UpdateWeeklySummaryDto) {
    const weeklySummary = await this.findOne(id);

    try {
      const updated = this.weeklySummaryRepository.create({
        ...weeklySummary,
        ...updateWeeklySummaryDto,
      });
      await this.weeklySummaryRepository.save(updated);

      return this.findOne(id);

    } catch (error) {
      handleDBErrors(error, 'update - weeklySummarys');
    }
  }

  async remove(id: number) {
    const weeklySummary = await this.findOne(id);

    try {
      await this.weeklySummaryRepository.update(id, { isDeleted: true });

      return weeklySummary;

    } catch (error) {
      handleDBErrors(error, 'remove - weeklySummarys')
    }
  }
}
