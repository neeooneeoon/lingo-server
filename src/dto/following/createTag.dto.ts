import { ApiProperty } from "@nestjs/swagger";

export class CreateTagDto {
    
    @ApiProperty({type: String, required: true})
    name: string;

    @ApiProperty({type: String, required: true})
    color: string;
}