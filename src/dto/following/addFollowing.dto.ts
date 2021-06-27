import { ApiProperty } from "@nestjs/swagger";

export class AddFollowingDto {

    @ApiProperty({type: String, required: true, description: 'Id người theo dõi'})
    followId: string;

}