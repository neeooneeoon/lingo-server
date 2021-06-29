import { ApiProperty } from "@nestjs/swagger";

export class AssignTagDto {

    @ApiProperty({type: String, required: true, description: "Following id"})
    followingId: string;

    @ApiProperty({type: String, required: true, description: "tag id"})
    tagId: string;

}
