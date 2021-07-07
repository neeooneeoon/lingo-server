import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { CreateTagDto, UserTag } from "@dto/following";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
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
    @ApiResponse({type: UserTag, status: 201})
    createTag(@Body() body: CreateTagDto, @UserCtx() user: JwtPayLoad) {
        return this.tagsService.createTag(user.userId, body);
    }

    @Get('/')
    @ApiOperation({ summary: 'Các thẻ của người dùng hiện tại' })
    @ApiResponse({type: [UserTag], status: 200})
    viewTags(@UserCtx() user: JwtPayLoad) {
        return this.tagsService.getUserTags(user.userId);
    }

    @Delete('/removeTag/:id')
    @ApiOperation({ summary: 'Xóa thẻ đã tạo' })
    @ApiParam({ type: String, name: 'id', required: true })
    @ApiResponse({type: String, description: 'Message', status: 200})
    removeTag(@Param('id') id: string) {
        return this.tagsService.removeTag(id);
    }

    @Put('/editTag/:id')
    @ApiOperation({ summary: 'Edit tag' })
    @ApiParam({ type: String, name: 'id', required: true })
    @ApiQuery({type: String, name: 'tagName', required: true})
    editTag(@Param('id') id: string, @Query('tagName') tagName: string) {
        return this.tagsService.editTag(id, tagName);
    }

}