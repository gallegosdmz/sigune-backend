import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Script } from './entities/script.entity';
import { Content } from './entities/content.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ContentFile } from './entities/content-file.entity';

@Module({
  controllers: [ScriptsController],
  providers: [ScriptsService],
  imports: [
    TypeOrmModule.forFeature([ Script, Content, ContentFile]),
    AuthModule,
  ],
  exports: [ TypeOrmModule, ScriptsService ],
})
export class ScriptsModule {}
