import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class UpdateUserDto {

    @IsEmail()
    @ApiProperty({ type: String, name:'email' })
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
    grade: number

    @ApiProperty({ type: "string" })
    displayName: string
}