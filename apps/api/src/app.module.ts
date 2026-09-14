import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PhotosModule } from './photos/photos.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ExperienceModule } from './experience/experience.module.js';

@Module({
  imports: [PrismaModule, PhotosModule, ProjectsModule, ExperienceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
