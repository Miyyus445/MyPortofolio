import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  findAll(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    const isFeatured = featured === undefined ? undefined : featured === 'true';
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.photos.findAll(isFeatured, Number.isNaN(take) ? undefined : take);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Record<string, any>) {
    return this.photos.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.photos.update(id, body);
  }

  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard)
  setFeatured(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.photos.setFeatured(id, Boolean(body?.isFeatured));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.photos.remove(id);
  }
}
