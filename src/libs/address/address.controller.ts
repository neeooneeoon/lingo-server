import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AddressService } from '@libs/address/address.service';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { DistrictItemDto, ProvinceItemDto } from '@dto/address';

@ApiTags('Address')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get('provinces')
  @ApiResponse({ type: [ProvinceItemDto], status: 200 })
  getProvinces() {
    return this.addressService.getProvinces();
  }

  @Get('/:provinceId/districts')
  @ApiParam({ type: Number, required: true, name: 'provinceId' })
  @ApiResponse({ type: [DistrictItemDto], status: 200 })
  getDistricts(@Param('provinceId') provinceId: number) {
    return this.addressService.getDistricts(provinceId);
  }
}
