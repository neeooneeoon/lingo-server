import { SentenceInLesson } from "@dto/sentence";
import { Sentence, SentenceDocument } from "@entities/sentence.entity";
import { SentencesHelper } from "@helpers/sentences.helper";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { from } from "rxjs";

@Injectable()
export class SentencesService {

    constructor(
        @InjectModel(Sentence.name) private sentenceModel: Model<SentenceDocument>,
        private sentencesHelper: SentencesHelper,
    ) { }

    public async findByIds(ids: string[]): Promise<SentenceInLesson[]> {
        try {
            const sentences = await this.sentenceModel.find({
                _id: {
                    $in: ids
                }
            });
            const result = sentences.map(sentence => {
                return this.sentencesHelper.mapSentenceToSentenceInLesson(sentence);
            })
            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async getSentence(id: string): Promise<SentenceDocument> {
        try {
            const sentence = await this.sentenceModel.findById(id);
            if (!sentence) {
                throw new BadRequestException( `Can't find sentence with id ${id}`);
            }
            return sentence;
        } catch (error) {
            throw new InternalServerErrorException(error);    
        }
    }

    public getSentencesINPreviousBooks(currentBookNId: number) {
       return from(
           this.sentenceModel
           .find(
            {
                bookNId: {
                    $lte: currentBookNId
                }
            },
            {
                content: 1,
                translate: 1,
                audio: 1,
                _id: 1
            }
           )
       )
    }
    public async getSentencesInUnit(bookNId: number, unitNId: number): Promise<SentenceDocument[]> {
        try {
            const sentences = await this.sentenceModel.find({
               bookNId: bookNId,
               unitNId: unitNId
            })
            return sentences;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    public async updateSentences(ids: number|string[], unitNId: number): Promise<void> {
        try {
            let filter = {};
            let update = {};
            if (Array.isArray(ids)) {
                filter = { _id: { $in: ids } };
                update = { unitNId: unitNId };
            }
            else {
                filter = { bookNId: ids, unitNId: unitNId };
                update = { unitNId: 100 * unitNId };
            }
            await this.sentenceModel.updateMany(filter, update);
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}