import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';
import { VersionsService } from '@admin/versions/versions.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MatchVersionDto, UpdateVersionDto } from '@dto/version';

@ApiTags('Version')
@Controller('api/admin/version')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UserPermission(Action.Manage))
  @Put('')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateVersionDto, required: true })
  @ApiOperation({ summary: 'Cập nhật version app' })
  updateAppVersion(@Body() body: UpdateVersionDto) {
    return this.versionsService.updateAppVersion(body.tag, body.description);
  }

  @Get('/checkMatch')
  @ApiQuery({ type: String, name: 'tag', required: true })
  @ApiResponse({ type: MatchVersionDto })
  @ApiOperation({ summary: 'Kiểm tra version' })
  checkMatchVersion(@Query('tag') tag: string) {
    return this.versionsService.checkMatchVersion(tag);
  }
}
