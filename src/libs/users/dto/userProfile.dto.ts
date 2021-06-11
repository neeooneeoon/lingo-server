import { ApiProperty } from "@nestjs/swagger";
import { Role, Rank } from '@utils/enums';

export class UserProfile {
    @ApiProperty({type: String, required: true})
    email: string;

    @ApiProperty({type: String, required: true})
    avatar: string;

    @ApiProperty({type: String, required: true})
    displayName: string;

    @ApiProperty({type: String, enum: Role})
    role: Role;
    
    @ApiProperty({type: Number})
    level: number;

    @ApiProperty({type: Number})
    score: number;

    @ApiProperty({type: Number})
    streak: number;

    @ApiProperty({type: Date})
    lastActive: Date;

    @ApiProperty({type: Number})
    grade: number;

    @ApiProperty({type: Number})
    xp: number;

    @ApiProperty({type: Rank})
    rank: Rank;
}