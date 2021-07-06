import { ApiProperty } from "@nestjs/swagger";
import { ProgressUnitMapping } from "./progressUnitMapping.dto";

export class ProgressBookMapping {

    @ApiProperty({type: String})
    bookId: string;

    @ApiProperty({type: Number})
    totalUnits: number;

    @ApiProperty({type: [ProgressUnitMapping]})
    units: ProgressUnitMapping[];

    @ApiProperty({type: Number})
    level: number;

    @ApiProperty({type: Number})
    score: number;

    @ApiProperty({type: Number})
    totalQuestions: number;

    @ApiProperty({type: Number})
    doneQuestions: number;
}