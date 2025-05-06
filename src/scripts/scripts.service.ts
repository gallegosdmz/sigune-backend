import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Script } from './entities/script.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { handleDBErrors } from 'src/utils';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ChangePositionContentDto } from './dto/change-position-content.dto';

@Injectable()
export class ScriptsService {
  constructor(
    @InjectRepository( Script )
    private readonly scriptRepository: Repository<Script>,

    @InjectRepository( Content )
    private readonly contentRepository: Repository<Content>,

    private readonly dataSource: DataSource,
  ) {}
  
  async create( createScriptDto: CreateScriptDto, user: User ) {
      try {
        const script = this.scriptRepository.create({
          ...createScriptDto,
          user
        })
        await this.scriptRepository.save( script );

        return script;

      } catch ( error ) {
        handleDBErrors( error, 'scripts' );
      }
  }

  async createContent( createContentDto: CreateContentDto, user: User ) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { script, position, ...contentDetails } = createContentDto;

    if ( !contentDetails.textContent ) contentDetails.textContent = 'Sin Contenido';

    if ( user.role.permissions.includes('admin_user') ) {
      if ( !script ) throw new NotFoundException(`Script not found`);

      contentDetails.status = true;
    }
  
    let scriptDB;
    if ( script !== null ) {
      scriptDB = await this.findOne( script );
    }
  
    const lastContent = await this.findLastContentInScript( script );

    try {
      const content = await this.contentRepository.create({
        ...contentDetails,
        position: lastContent,
        user,
        script: script !== null ? scriptDB : script,
      });
      await queryRunner.manager.save( content );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return content;

    } catch ( error ) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      handleDBErrors( error, 'scripts' );
    }
  }


  async findAll( paginationDto: PaginationDto ) {
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
          },
          user: true,
        },
        order: {
          id: 'DESC',
        }
      });

      return scripts;

    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async findAllContents( ) {
    try {
      const contents = await this.contentRepository.find({
        where: {
          isDeleted: false,
        },
        relations: {
          script: {
            user: true,
          },
          user: true,
        },
      });

      return contents;

    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async findAllContentsForUser( user: User ) {
    try {
      const contents = await this.contentRepository.find({
        where: {
          user,
          isDeleted: false,
        },
        relations: {
          script: true,
        },
      });

      return contents;
      
    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async findAllContentsForScript( idScript: number ) {
    await this.findOne( idScript );

    try {
      const contents = await this.contentRepository.find({
        where: {
          isDeleted: false,
          script: {id: idScript},
        },
        relations: {
          script: {
            user: true,
          },
          user: true,
        },
        order: {
          position: 'ASC', // Ordenar de menor a mayor
        },
      });

      return contents;
      
    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async findOne( id: number ) {
    const script = await this.scriptRepository.findOne({
      where: { id, isDeleted: false },
      relations: { contents: { user: true }, user: true },
    });
    if ( !script ) throw new NotFoundException(`Script with id: ${ id } not found`);

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
        }, 
      });

      return contents;

    } catch ( error ) {
      handleDBErrors( error, 'script' );
    }
  }

  async findOneContent( id: number ) {
    const content = await this.contentRepository.findOne({
      where: { id, isDeleted: false },
      relations: { script: { user: true }, user: true },
    });
    if ( !content ) throw new NotFoundException(`Content with id: ${ id } not found`);

    return content;
  }

  async findLastContentInScript( id: number ) {
    const content = await this.contentRepository.findOne({
      where: {
        script: {
          id: id,
        },
        isDeleted: false,
      },
      order: { position: 'DESC' },
    });
    if ( !content ) return 0;

    return content.position! + 1;
  }

  async update(id: number, updateScriptDto: UpdateScriptDto) {
    const script = await this.findOne( id );

    try {
      Object.assign( script, updateScriptDto );
      await this.scriptRepository.save( script );

      return this.findOne( id );

    } catch ( error ) {
      handleDBErrors( error, 'scripts')
    }
  }

  async updateContent( id: number, updateContentDto: UpdateContentDto, user: User ) {
    const content = await this.findOneContent( id );

    if ( !user.role.permissions.includes('admin_user') && user.id !== content.user.id ) {
      throw new UnauthorizedException(`This user is not authorized for modifications to content: ${ id }`);
    }

    if ( updateContentDto.script ) {
      await this.findOne( updateContentDto.script );
    }
    
    try {
      Object.assign( content, updateContentDto );
      await this.contentRepository.save( content );

      return this.findOneContent( id );

    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async changePositionContent( id: number, changePositionContent: ChangePositionContentDto ) {
    const content = await this.findOneContent( id );

    try {
     Object.assign( content, { position: changePositionContent.position } );
     await this.contentRepository.save( content );
     
     return this.findOneContent( id );
    
    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }

  async countContentsByDateRange(startDate: Date, endDate: Date) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('content.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere('content.isDeleted = false')
      .limit(700)
      .getMany(); // obtenemos los contenidos limitados
  
    const total = contents.length;
  
    const byDependenceMap = new Map<string, number>();
    const byClassificationMap = new Map<string, number>();
  
    for (const content of contents) {
      // Dependence count
      if (content.dependence) {
        byDependenceMap.set(
          content.dependence,
          (byDependenceMap.get(content.dependence) || 0) + 1,
        );
      }
  
      // Classification count
      if (content.classification) {
        byClassificationMap.set(
          content.classification,
          (byClassificationMap.get(content.classification) || 0) + 1,
        );
      }
    }
  
    const byDependence = Array.from(byDependenceMap.entries()).map(([dependence, count]) => ({
      dependence,
      count,
    }));
  
    const byClassification = Array.from(byClassificationMap.entries()).map(([classification, count]) => ({
      classification,
      count,
    }));
  
    return {
      total,
      byDependence,
      byClassification,
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

    await this.findOne( id );

    try {
      
      await queryRunner.manager.update( Script, { id }, { isDeleted: true } );
      await queryRunner.manager.update( Content, { script: id }, { isDeleted: true } );
      

      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return {
        message: `Script with id: ${ id } is removed successfully`,
      }

    } catch ( error ) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      handleDBErrors( error, 'scripts' );
    }
  }

  async removeContent( id: number ) {
    await this.findOneContent( id );

    try {
      await this.contentRepository.update( id, { isDeleted : true } );

      return {
        message: `Content with id: ${ id } is removed successfully`,
      }

    } catch ( error ) {
      handleDBErrors( error, 'scripts' );
    }
  }
  
}
