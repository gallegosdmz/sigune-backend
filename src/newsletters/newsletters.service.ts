import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { Repository } from 'typeorm';
import { handleDBErrors } from 'src/utils';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class NewslettersService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsLetterRepository: Repository<Newsletter>,

  ) {}

  async create(createNewsletterDto: CreateNewsletterDto) {
    try {
      const newsLetter = this.newsLetterRepository.create(createNewsletterDto);
      await this.newsLetterRepository.save(newsLetter);

      return newsLetter;

    } catch (error) {
      handleDBErrors(error, 'newsletter - create');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;

    try {
      const newsLetters = await this.newsLetterRepository.find({
        take: limit,
        skip: offset,
        where: {
          isDeleted: false,
        },
        order: {
          id: 'DESC'
        }
      });

      return newsLetters;

    } catch (error) {
      handleDBErrors(error, 'newsLetter - findAll');
    }
  }

  async findOne(id: number) {
    const newsLetter = await this.newsLetterRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!newsLetter) throw new NotFoundException(`NewsLetter with id: ${ id } not found`);

    return newsLetter;
  }

  async update(id: number, updateNewsletterDto: UpdateNewsletterDto) {
    const newsLetter = await this.findOne(id);

    try {
      Object.assign(newsLetter, updateNewsletterDto);
      await this.newsLetterRepository.save(newsLetter);

      return this.findOne(id);

    } catch (error) {
      handleDBErrors(error, 'newsLetter - update');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.newsLetterRepository.update(id, { isDeleted: true });

      return {
        message: `NewsLetter with id: ${ id } is removed successfully`,
      }

    } catch (error) {
      handleDBErrors(error, 'newsLetter - remove');
    }
  }
}
