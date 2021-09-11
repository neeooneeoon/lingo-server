import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';
import { AddressService } from '@libs/address/address.service';

@Controller('api/admin/address')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies(new UserPermission(Action.Manage))
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('resetProvinces')
  async resetProvinces() {
    return this.addressService.resetProvinces();
  }

  @Post('resetDistricts')
  async resetDistricts() {
    return this.addressService.resetDistricts();
  }

  @Post('resetSchools')
  async resetSchools() {
    return this.addressService.resetDistricts();
  }
}
