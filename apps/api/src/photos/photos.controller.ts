import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PhotosService } from './photos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

@Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  findAll(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    const isFeatured = featured === undefined ? undefined : featured === 'true';
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.photos.findAll(isFeatured, Number.isNaN(take) ? undefined : take);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const imageUrl = `/uploads/${file.filename}`;
    return { imageUrl };
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
