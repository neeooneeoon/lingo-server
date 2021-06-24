import { ApiProperty } from "@nestjs/swagger";

export class BookGrade {
    @ApiProperty({type: String})
    _id: string;

    @ApiProperty({type: String})
    name: string;

    @ApiProperty({type: Number})
    grade: number;

    @ApiProperty({type: String})
    cover: string;

    @ApiProperty({type: Number})
    totalWords: number;

    @ApiProperty({type: Number})
    totalUnits: number;

    @ApiProperty({type: String})
    description: string;

    @ApiProperty({type: Number})
    totalLessons: number;

    @ApiProperty({type: Number})
    doneLessons: number;

    @ApiProperty({type: Number})
    totalQuestions: number;

    @ApiProperty({type: Number})
    doneQuestions: number;
}