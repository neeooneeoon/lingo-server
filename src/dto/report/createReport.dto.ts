import { ApiProperty } from "@nestjs/swagger";

export class CreateReportDto {

    @ApiProperty({type: String, required: true})
    bookId: string;

    @ApiProperty({type: String, required: true})
    unitId: string;

    @ApiProperty({type: Number, required: true})
    level: number;

    @ApiProperty({type: Number, required: true})
    lesson: number;

    @ApiProperty({type: String, required: true})
    questionId: string;

    @ApiProperty({type: 'array', items: {type: 'string'}})
    errors: Array<string>;

    @ApiProperty({type: String, required: false})
    comment?: string;
}