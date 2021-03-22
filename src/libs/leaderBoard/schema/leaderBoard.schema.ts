import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';


@Schema()
export class LeaderBoard {

    @Prop({ type: [{ userId: { type: Types.ObjectId }, point: { type: Number } }], default: [] })
    champions: Array<Champion>

    @Prop({ type: String, enum: ["Legend", "Diamond", "Gold", "Silver", "Bronze", "None"] })
    rank: string

    @Prop({ type: Number })
    group: number;

    @Prop({ type: Number })
    index: number;

}

export type LeaderBoardDocument = Document & LeaderBoard;
export const LeaderBoardSchema = SchemaFactory.createForClass(LeaderBoard);

export enum Rank {
    Legend = "Legend",
    Diamond = "Diamond",
    Gold = "Gold",
    Silver = "Silver",
    Bronze = "Bronze",
    None = "None"
}
export class Champion {
    image: string;
    userId: Types.ObjectId;
    point: number;
    displayName: string;
}
