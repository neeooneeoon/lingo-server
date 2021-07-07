import { ApiProperty } from "@nestjs/swagger"
import { ProgressUnit } from "./progressUnit.dto";

export class ActiveBookProgress {
    @ApiProperty({type: Number})
    grade: number;

    @ApiProperty({type: String})
    name: string;

    @ApiProperty({type: String})
    cover: string;

    @ApiProperty({type: String})
    bookId: string;

    @ApiProperty({type: Number})
    doneLessons: number;

    @ApiProperty({type: Number})
    totalLessons: number;

    @ApiProperty({type: Date})
    lastDid: Date;

    @ApiProperty({type: [ProgressUnit]})
    units: Partial<ProgressUnit>[]

}