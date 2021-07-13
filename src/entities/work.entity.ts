import { UnitWork } from '@dto/works';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema()
export class Work {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  bookId: string;

  @Prop({
    type: [
      {
        unitId: String,
        levels: [
          {
            levelIndex: Number,
            lessons: [
              {
                lessonIndex: Number,
                works: [
                  {
                    timeStart: Date,
                    timeEnd: Date,
                    results: [],
                  },
                ],
              },
            ],
            incorrectList: [String],
          },
        ],
        incorrectList: [String],
        didList: [String],
      },
    ],
    default: [],
  })
  units: UnitWork[];
}

export const WorkSchema = SchemaFactory.createForClass(Work);
export type WorkDocument = Document & Work;

WorkSchema.index({ userId: 1, bookId: 1 }, { unique: true });
