import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ScriptsModule } from 'src/scripts/scripts.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    AuthModule,
    ScriptsModule,
  ]
})
export class FilesModule {}
