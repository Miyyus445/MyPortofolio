import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ExperienceService } from './experience.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  findAll() {
    return this.experience.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Record<string, any>) {
    return this.experience.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.experience.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.experience.remove(id);
  }
}
