import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Question {
    _id: string;
    group: string;
    focus: string;
    type: string;
    choices: string[];
    hiddenIndex: number;
}

@Schema()
export class QuestionHolder {

    @Prop({ type: String })
    bookId: string;

    @Prop({ type: String })
    unitId: string;

    @Prop({ type: [Object] })
    questions: [Question]

}

export type QuestionHolderDocument = Document & QuestionHolder;
export const QuestionHolderSchema = SchemaFactory.createForClass(QuestionHolder);
