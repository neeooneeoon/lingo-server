import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BackupsService } from '../providers/backups.service';

@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies(new UserPermission(Action.Manage))
@Controller('api/admin/backups')
@ApiTags('Backups')
@ApiBearerAuth()
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get('/')
  startBackup() {
    return this.backupsService.restoreChoicesFromBackup();
  }
}
