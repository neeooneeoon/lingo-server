import { SentenceInLesson } from "@dto/sentence";
import { Sentence, SentenceDocument } from "@entities/sentence.entity";
import { SentencesHelper } from "@helpers/sentences.helper";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

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

}