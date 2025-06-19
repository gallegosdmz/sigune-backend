import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { DepartmentsModule } from './departments/departments.module';
import { UsersModule } from './users/users.module';
import { ScriptsModule } from './scripts/scripts.module';
import { FilesModule } from './files/files.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { DailySummaryModule } from './daily-summary/daily-summary.module';
import { WeeklySummarysModule } from './weekly-summarys/weekly-summarys.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, // quitar en producción
    }),

    CommonModule,

    FilesModule,

    AuthModule,

    RolesModule,

    DepartmentsModule,

    UsersModule,

    ScriptsModule,

    NewslettersModule,

    DailySummaryModule,

    WeeklySummarysModule,
  ],
})
export class AppModule {}
