import { Controller, Get, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.projects.findAll(Number.isNaN(take) ? undefined : take);
  }
}
