import { Controller, Get } from '@nestjs/common';
import { ExperienceService } from './experience.service.js';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  findAll() {
    return this.experience.findAll();
  }
}
