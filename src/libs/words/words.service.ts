import { WordInLesson } from "@dto/word/wordInLesson.dto";
import { Word, WordDocument } from "@entities/word.entity";
import { WordsHelper } from "@helpers/words.helper";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class WordsService {

    constructor(
        @InjectModel(Word.name) private wordModel: Model<WordDocument>,
        private wordsHelper: WordsHelper,
    ) { }

    async findByIds(ids: string[]): Promise<WordInLesson[]> {
        try {
            const words = await this.wordModel.find({
                _id: {
                    $in: ids
                }
            });
            const result = words.map(word => {
                return this.wordsHelper.mapWordToWordInLesson(word);
            })
            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}