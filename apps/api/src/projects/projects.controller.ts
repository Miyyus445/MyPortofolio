import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.projects.findAll(Number.isNaN(take) ? undefined : take);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Record<string, any>) {
    return this.projects.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.projects.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projects.remove(id);
  }
}
