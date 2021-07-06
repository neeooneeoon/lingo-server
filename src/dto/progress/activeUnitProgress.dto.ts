import { ApiProperty } from "@nestjs/swagger";

export class ActiveUnitProgress {

    @ApiProperty({type: String})
    unitId: string;

    @ApiProperty({type: String})
    normalImage: string;

    @ApiProperty({type: String})
    blueImage: string;

    @ApiProperty({type: Number})
    totalLevels: number;

    @ApiProperty({type: Number})
    passedLevels: number;

}