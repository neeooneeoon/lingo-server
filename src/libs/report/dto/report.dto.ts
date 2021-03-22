import { ApiProperty } from '@nestjs/swagger';

export class ReportQuestion {

    @ApiProperty({ type: String })
    bookId: string;

    @ApiProperty({ type: String })
    unitId: string;

    @ApiProperty({ type: String })
    questionId: string;

    @ApiProperty({ type: [String] })
    errors: Array<string>

    @ApiProperty({ type: String })
    comment: string;

}