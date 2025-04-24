import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  imports: [
    TypeOrmModule.forFeature([ Department ]),
    AuthModule,
  ],

  exports: [ TypeOrmModule ],
})
export class DepartmentsModule {}
