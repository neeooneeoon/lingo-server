import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Following {

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: true, ref: 'User'})
    followUser: Types.ObjectId;

    @Prop({type: Types.ObjectId, required: false, default: null, ref: 'Tag'})
    tag: Types.ObjectId;
    

}

export const FollowingSchema = SchemaFactory.createForClass(Following);
export type FollowingDocument = Document & Following;

FollowingSchema.index(
    { user: 1, followUser: 1 },
    { unique: true }
)