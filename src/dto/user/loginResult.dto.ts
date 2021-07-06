import { ApiProperty } from "@nestjs/swagger";
import { UserProfile } from "./userProfile.dto";

export class LoginResultDto {

    @ApiProperty({type: UserProfile})
    user: UserProfile;

    @ApiProperty({type: String, required: true})
    token: string;

    @ApiProperty({type: String, required: true})
    refreshToken: string;

}