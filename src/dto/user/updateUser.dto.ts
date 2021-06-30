import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {

    @ApiProperty({type: String, required: false})
    givenName?: string;

    @ApiProperty({type: String, required: false})
    familyName?: string;

    @ApiProperty({type: String, required: true})
    displayName: string;

    @ApiProperty({type: Date, required: false})
    birthday?: Date;

    @ApiProperty({type: Number, required: true, default: 1})
    grade: number;
}