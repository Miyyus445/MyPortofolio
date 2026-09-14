import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller.js';
import { PhotosService } from './photos.service.js';

@Module({
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
