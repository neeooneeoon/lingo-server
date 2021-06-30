import { ApiProperty } from "@nestjs/swagger";

export class ViewFollowingsDto {

    @ApiProperty({type: String, required: true, default: 'all', description: 'Lọc người theo dõi bằng tagId, mặc định bằng "all"'})
    tagId: string;

}