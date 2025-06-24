import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { ContentFile } from 'src/scripts/entities/content-file.entity';
import { ScriptsService } from 'src/scripts/scripts.service';
import { handleDBErrors } from 'src/utils';
import { PassThrough } from 'stream';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  private driveClient;

  constructor(
    @InjectRepository(ContentFile)
    private readonly contentFileRepository: Repository<ContentFile>,

    private readonly scriptService: ScriptsService,
  ) {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'src/files/drive.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async uploadToDrive(contentId: number, file: Express.Multer.File) {
    const stream = new PassThrough();
    stream.end(file.buffer);

    const response = await this.driveClient.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: ['1GoAJKiNIOsHJwPqnjOlLChl5Lxbvi9sb'],
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
    });

    const fileId = response.data.id;

    // Hacer el archivo públic
    await this.driveClient.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Obtener los links de vista y descarga
    const fileMeta = await this.driveClient.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });

    const content = await this.scriptService.findOneContent(contentId);

    const contentFile = this.contentFileRepository.create({url: fileMeta.data.webViewLink, content});
    await this.contentFileRepository.save(contentFile);

    return {
      fileId: fileMeta.data.id,
      name: fileMeta.data.name,
      mimeType: fileMeta.data.mimeType,
      viewLink: fileMeta.data.webViewLink,
      downloadLink: fileMeta.data.webContentLink,
      message: 'Audio subido y compartido correctamente en Google Drive',
    };
  }

  async getFileById( fileId: string ) {
    try {
      const file = await this.driveClient.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, webContentLink',
      });

      return {
        id: file.data.id,
        name: file.data.name,
        mimeType: file.data.mimeType,
        viewLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink,
      };

    } catch ( error ) {
      handleDBErrors( error, 'file service = getFileById' );
    }
  }

}
