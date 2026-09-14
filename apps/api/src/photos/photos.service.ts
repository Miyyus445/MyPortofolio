import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(featured?: boolean, limit?: number) {
    return this.prisma.photo.findMany({
      where: featured === undefined ? undefined : { isFeatured: featured },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
