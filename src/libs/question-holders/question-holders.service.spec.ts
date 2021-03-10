import { Test, TestingModule } from '@nestjs/testing';
import { QuestionHoldersService } from './question-holders.service';

describe('QuestionHoldersService', () => {
  let service: QuestionHoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionHoldersService],
    }).compile();

    service = module.get<QuestionHoldersService>(QuestionHoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
