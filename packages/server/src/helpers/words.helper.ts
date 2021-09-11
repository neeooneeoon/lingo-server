import { EvaluateWordDto, WordInLesson } from '@dto/word';
import { WordDocument } from '@entities/word.entity';
import { AddWordDto } from '@dto/evaluation';
import { LeanDocument } from 'mongoose';

export class WordsHelper {
  public mapWordToWordInLesson(word: LeanDocument<WordDocument>): WordInLesson {
    return {
      _id: word._id,
      content: word.content,
      types: word.types,
      meaning: word.meaning,
      imageRoot: word.imageRoot,
      pronunciations: word.pronunciations,
    };
  }

  public serializeEvaluatedWord(input: EvaluateWordDto): AddWordDto {
    return {
      _id: input.word._id,
      content: input.word.content,
      meaning: input.word.meaning,
      imageRoot: input.word.imageRoot,
      codes: input.codes,
      bookId: input.bookId,
      level: input.level,
      unitId: input.unitId,
    };
  }
}
