import { ApiProperty } from "@nestjs/swagger";

export class WordInLesson {

    @ApiProperty({type: String})
    _id: string;

    @ApiProperty({type: String})
    content: string;

    @ApiProperty({type: [String]})
    types: string[];

    @ApiProperty({type: String})
    meaning: string;

    @ApiProperty({type: String})
    imageRoot: string;
}