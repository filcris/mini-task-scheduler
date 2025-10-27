import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPrismaService {
  user = {
    findUnique: jest.fn(),
  };

  task = {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  };
}
