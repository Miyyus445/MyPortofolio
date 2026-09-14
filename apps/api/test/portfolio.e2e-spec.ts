import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Portfolio endpoints (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/photos (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/photos').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/projects (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/projects').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/experience (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/experience').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
