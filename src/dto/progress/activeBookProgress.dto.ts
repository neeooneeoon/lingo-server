import { ApiProperty } from "@nestjs/swagger"

export class ActiveBookProgress {

    @ApiProperty({type: String})
    cover: string;

    @ApiProperty({type: String})
    bookId: string;

    @ApiProperty({type: Number})
    doneLessons: number;

    @ApiProperty({type: Number})
    totalLessons: number;
}