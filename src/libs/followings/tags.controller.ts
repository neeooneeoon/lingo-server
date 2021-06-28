import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/tags')
export class TagsController {

    @Post('create')
    @ApiOperation({summary: 'Tạo thẻ'})
    createTag(@Body()body: any) {
        
    }

}