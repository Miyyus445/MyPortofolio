import { Controller, Get, Query } from '@nestjs/common';
import { PhotosService } from './photos.service.js';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  findAll(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    const isFeatured = featured === undefined ? undefined : featured === 'true';
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.photos.findAll(isFeatured, Number.isNaN(take) ? undefined : take);
  }
}
