import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class UpdateUserDto {

    @IsEmail()
    @ApiProperty({ type: "string" })
    email: string

    @ApiProperty({ type: "string" })
    fullName: string
    
    @ApiProperty({ type: "string" })
    givenName: string

    @ApiProperty({ type: "string" })
    familyName: string

    @ApiProperty({ type: "string" })
    birthday: string

    @ApiProperty({ type: Number, default: 1 })
    grade: string

    @ApiProperty({ type: "string" })
    displayName: string
}