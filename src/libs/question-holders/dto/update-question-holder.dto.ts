import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionHolderDto } from './create-question-holder.dto';

export class UpdateQuestionHolderDto extends PartialType(CreateQuestionHolderDto) {}
