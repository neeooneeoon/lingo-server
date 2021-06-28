import { FollowingUser } from "@dto/following/followingUser.dto";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Following {

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({
        type: [{
            followUser: {
                type: Types.ObjectId,
                required: true,
                ref: 'User',
            },
            tag: {
                type: String,
                required: true,
                ref: 'Tag',
                default: ''
            }
        }], default: []
    })
    listFollowing: FollowingUser[];

}

export const FollowingSchema = SchemaFactory.createForClass(Following);
export type FollowingDocument = Document & Following;

FollowingSchema.index(
    { user: 1 },
    { unique: true }
)