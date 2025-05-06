import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService],
  imports: [
    TypeOrmModule.forFeature([Newsletter]),

    AuthModule,
  ]
})
export class NewslettersModule {}
