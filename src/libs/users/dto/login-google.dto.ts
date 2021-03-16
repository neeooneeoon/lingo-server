import { ApiProperty } from '@nestjs/swagger';

export class LoginGoogle {

    @ApiProperty({ type: String, required: true, description: "Google access token" })
    access_token: string;

}