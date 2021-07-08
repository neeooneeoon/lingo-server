import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Rank, Role } from '@utils/enums';

@Schema({ timestamps: true })
export class User {

    @Prop({ type: String, required: false, default: '' })
    facebookId?: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String, required: true, default: '' })
    avatar: string;

    @Prop({ type: String, required: false, default: '' })
    familyName: string;

    @Prop({ type: String, required: true })
    givenName: string;

    @Prop({ type: String, required: true })
    displayName: string;

    @Prop({ type: Date, required: false, default: '' })
    birthday?: Date;
    
    @Prop({ type: Number, required: false, default: 0 })
    grade?: number;

    @Prop({ type: String, required: true, enum: Object.values(Rank) })
    rank: Rank;

    @Prop({ type: String, required: true, default: 'vi' })
    language: string;

    @Prop({ type: String, required: true, default:'Member', enum: Object.values(Role) })
    role: Role;

    @Prop({ type: Number, required: true, default: 0 })
    level: number;

    @Prop({ type: Number, required: true, default: 0 })
    score: number;

    @Prop({ type: Number, required: true, default: 1 })
    loginCount: number;

    @Prop({ type: Number, required: false, default: 0 })
    streak?: number;

    @Prop({ type: Date, required: false })
    lastActive?: Date;

    @Prop({ type: Number, required: false })
    xp?: number;

    @Prop({ type: String, required: false })
    password?: string;
    
    @Prop({type: Date, required: false})
    createdAt?: Date

};

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;

UserSchema.virtual('followings', {
    ref: 'Following',
    localField: '_id',
    foreignField: 'listFollowing',
    justOne: false
})