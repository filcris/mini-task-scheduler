import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPrismaService {
  user = { findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() };
  task = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
