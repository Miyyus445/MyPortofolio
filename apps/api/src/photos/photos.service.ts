import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

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

  create(data: Record<string, any>) {
    return this.prisma.photo.create({ data: data as any });
  }

  update(id: string, data: Record<string, any>) {
    return this.prisma.photo.update({ where: { id }, data: data as any });
  }

  setFeatured(id: string, isFeatured: boolean) {
    return this.prisma.photo.update({ where: { id }, data: { isFeatured } });
  }

  async remove(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    await this.prisma.photo.delete({ where: { id } });
    if (photo?.imageUrl?.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), photo.imageUrl);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
    return { deleted: true };
  }
}
