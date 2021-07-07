import { UserProfile } from "@dto/user";
import { ApiProperty } from "@nestjs/swagger";

export class CheckFollowing extends UserProfile {

    @ApiProperty({type: Boolean, default: false})
    followed: boolean;

}