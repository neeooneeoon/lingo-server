import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsEmail } from 'class-validator';

export enum RankEnum  {
    Legend = "Legend",
    Diamond = "Diamond",
    Gold = "Gold",
    Silver = "Silver",
    Bronze = "Bronze",
    None = "None",
}

@Schema({ timestamps: true })
export class User {

    @Prop({ type: String })
    facebookId: string;

    @IsEmail()
    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    avatar: string;

    @Prop({ type: String })
    familyName: string;

    @Prop({ type: String })
    givenName: string;

    @Prop({ type: String })
    birthday: string;

    @Prop({ type: Number })
    grade: number;

    @Prop({ type: String, enum: RankEnum })
    rank: RankEnum;

    @Prop({ type: String, default: "vi" })
    language: string;

    @Prop({ type: String })
    displayName: string;

    @Prop({ type: String })
    role: string;

    @Prop({ type: Number })
    level: number;

    @Prop({ type: Number })
    score: number;

    @Prop({ type: Number })
    loginCount: number;

    @Prop({ type: Number })
    streak: number;

    @Prop({ type: Date })
    lastActive: Date;

    @Prop({ type: Number })
    xp: number;

}

export type UserDocument = Document & User;
export const UserSchema = SchemaFactory.createForClass(User);