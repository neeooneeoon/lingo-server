import { ProgressBook } from '@dto/progress/progressBook.dto';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Progress {
  @Prop({ type: Types.ObjectId, unique: 1 })
  userId: Types.ObjectId;

  @Prop({
    type: [
      {
        bookId: String,
        totalUnits: Number,
        score: Number,
        level: Number,
        doneQuestions: Number,
        correctQuestions: Number,
        totalLessons: Number,
        doneLessons: Number,
        lastDid: Date,
        units: [
          {
            unitId: String,
            totalLevels: Number,
            passedLevels: Number,
            doneLessons: Number,
            doneQuestions: Number,
            correctQuestions: Number,
            lastDid: Date,
            normalImage: String,
            blueImage: String,
            unitName: String,
            totalLessons: Number,
            levels: [
              {
                levelIndex: Number,
                totalLessons: Number,
                doneLessons: Number,
                passed: Boolean,
                lessons: [Number],
              },
            ],
          },
        ],
      },
    ],
  })
  books: ProgressBook[];
}

export type ProgressDocument = Document & Progress;
export const ProgressSchema = SchemaFactory.createForClass(Progress);

ProgressSchema.index({ userId: 1 }, { unique: true });
