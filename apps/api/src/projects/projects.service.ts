import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(limit?: number) {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  create(data: Record<string, any>) {
    return this.prisma.project.create({ data: data as any });
  }

  update(id: string, data: Record<string, any>) {
    return this.prisma.project.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
