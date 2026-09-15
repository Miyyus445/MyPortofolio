import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Record<string, any>) {
    return this.prisma.experience.create({ data: data as any });
  }

  update(id: string, data: Record<string, any>) {
    return this.prisma.experience.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.experience.delete({ where: { id } });
  }
}
