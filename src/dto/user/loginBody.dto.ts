import { ApiProperty } from "@nestjs/swagger";

export class LoginBodyDto {
    @ApiProperty({
        type: String,
        required: true,
        description: "Access token"
    })
    accessToken: string;
}
