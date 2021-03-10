import { Test, TestingModule } from '@nestjs/testing';
import { QuestionHoldersController } from './question-holders.controller';
import { QuestionHoldersService } from './question-holders.service';

describe('QuestionHoldersController', () => {
  let controller: QuestionHoldersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionHoldersController],
      providers: [QuestionHoldersService],
    }).compile();

    controller = module.get<QuestionHoldersController>(QuestionHoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
