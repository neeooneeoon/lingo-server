import { Champion } from "@dto/leaderBoard";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Rank } from "@utils/enums";
import { Types, Document } from "mongoose";

@Schema()
export class LeaderBoard {

    @Prop({
        type: [{
            userId: Types.ObjectId,
            point: Number,
            image: String,
            displayName: String
        }],
        default: []
    })
    champions: Champion[];

    @Prop({type: String, required: true, enum: Object.values(Rank)})
    rank: Rank;

    @Prop({type: Number})
    group: number;

    @Prop({type: Number})
    index: number;

}

export const LeaderBoardSchema = SchemaFactory.createForClass(LeaderBoard);
export type LeaderBoardDocument = Document & LeaderBoard;

LeaderBoardSchema.index({rank: 1, grade: 1}, {unique: true});