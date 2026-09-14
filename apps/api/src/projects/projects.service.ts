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
}
