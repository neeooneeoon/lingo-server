import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { CreateTagDto } from "@dto/following";
import { TagDocument } from "@entities/tag.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
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
    @ApiOperation({ summary: 'Tạo thẻ' })
    @ApiBody({ type: CreateTagDto })
    createTag(@Body() body: CreateTagDto, @UserCtx() user: JwtPayLoad) {
        return this.tagsService.createTag(user.userId, body);
    }

    @Get('/')
    @ApiOperation({ summary: 'Get tags' })
    viewTags(@UserCtx() user: JwtPayLoad) {
        return this.tagsService.viewTags(user.userId);
    }

    @Delete('/removeTag/:id')
    @ApiOperation({ summary: 'Remove tag' })
    @ApiParam({ type: String, name: 'id', required: true })
    async removeTag(@Param('id') id: string) {
        return this.tagsService.removeTag(id);
    }

    @Put('/editTag/:id')
    @ApiOperation({ summary: 'Edit tag' })
    @ApiParam({ type: String, name: 'id', required: true })
    @ApiQuery({type: String, name: 'tagName', required: true})
    async editTag(@Param('id') id: string, @Query('tagName') tagName: string) {
        return this.tagsService.editTag(id, tagName);
    }

}