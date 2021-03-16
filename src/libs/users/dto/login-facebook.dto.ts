import { ApiProperty } from '@nestjs/swagger';

export class LoginFacebook {

    @ApiProperty({ type: String, required: true, description: "Facebook access_token" })
    access_token: string;

}