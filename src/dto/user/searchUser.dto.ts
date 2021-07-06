import { ApiProperty } from "@nestjs/swagger";

export class SearchUser {

    @ApiProperty({type: String})
    userId: string;

    @ApiProperty({type: String})
    email: string;

    @ApiProperty({type: String})
    avatar: string;

    @ApiProperty({type: String})
    displayName:string;

    @ApiProperty({type: Boolean, required: false, description: 'This field is optional', default: false})
    followed?: boolean

}