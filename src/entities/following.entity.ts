import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class Following {

    @Prop({type: Types.ObjectId, required: true})
    user: Types.ObjectId;

    @Prop({type: [{type: Types.ObjectId, ref: 'User', default: [], required: false}]})
    listFollowing?: Types.ObjectId[];
    
}

export const FollowingSchema = SchemaFactory.createForClass(Following);
export type FollowingDocument = Document & Following;

FollowingSchema.index(
    {user: 1, listFollowing: 1},
    {unique: true}
)