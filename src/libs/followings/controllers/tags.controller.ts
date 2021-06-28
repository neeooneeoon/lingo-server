import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { CreateTagDto } from "@dto/following";
import { TagDocument } from "@entities/tag.entity";
import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { TagsService } from "../providers/tags.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/tags')
export class TagsController {

    constructor(
        private tagsService: TagsService,
    ) { }

    @Post('add')
    @ApiOperation({summary: 'Tạo thẻ'})
    @ApiBody({type: CreateTagDto})
    createTag(@Body()body: CreateTagDto, @UserCtx()user: JwtPayLoad) {
        return this.tagsService.createTag(user.userId, body);
    }

    @Get('/')
    @ApiOperation({summary: 'Get tags'})
    viewTags(@UserCtx() user: JwtPayLoad) {
        return this.tagsService.viewTags(user.userId);
    }

    @Put('/removeTag/:id')
    @ApiOperation({summary: 'Remove tag'})
    @ApiParam({type: 'string', name: 'id', required: true})
    removeTag(@Param('id') id: string) {
        
    }

}