import { ApiProperty } from "@nestjs/swagger";

export class GetQuestionHolderInput {
    
    @ApiProperty({type: String, required: true})
    bookId: string;

    @ApiProperty({type: String, required: true})
    unitId: string;

    @ApiProperty({type: Number, required: true})
    level: number;

}