import { Controller, Put, UseGuards } from '@nestjs/common';
import { ProgressesService } from '@libs/progresses/progresses.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';
import { WorksService } from '@libs/works/works.service';

@Controller('api/admin/progress')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies(new UserPermission(Action.Manage))
export class ProgressController {
  constructor(
    private readonly progressService: ProgressesService,
    private readonly worksService: WorksService,
  ) {}

  @Put('backup')
  async backup() {
    await Promise.all([
      this.progressService.backupUserProgress(),
      this.worksService.backup(),
    ]);
  }

  @Put('rollbackBooks')
  async rollBackBooks() {}
}
