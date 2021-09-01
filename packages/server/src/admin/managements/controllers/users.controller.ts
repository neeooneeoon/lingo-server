import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { FollowingsService } from '@libs/followings/providers/followings.service';
import { UsersService } from '@libs/users/providers/users.service';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Action } from '@utils/enums';

@Controller('api/admin/users')
@ApiBearerAuth()
@ApiTags('Admin')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class UserManagementController {
  constructor(
    private readonly usersService: UsersService,
    private followingsService: FollowingsService,
  ) {}

  @CheckPolicies(new UserPermission(Action.Manage))
  @Post('renew')
  renewAllUsers() {
    return this.usersService.renewAllUsers();
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Post('/followings/renew')
  renewAllFollowings() {
    return this.followingsService.renewAllFollowings();
  }
}
