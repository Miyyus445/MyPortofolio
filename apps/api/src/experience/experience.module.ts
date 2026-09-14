import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller.js';
import { ExperienceService } from './experience.service.js';

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService],
})
export class ExperienceModule {}
