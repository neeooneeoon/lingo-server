import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AddressService } from '@libs/address/address.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ description: 'Danh sách tất cả các tỉnh, thành phố' })
  getProvinces() {
    return this.addressService.getProvinces();
  }

  @Get('/:provinceId/districts')
  @ApiParam({ type: Number, required: true, name: 'provinceId' })
  @ApiResponse({ type: [DistrictItemDto], status: 200 })
  @ApiOperation({
    description: 'Danh sách tất cả các huyện trong tỉnh, thành phố',
  })
  getDistricts(@Param('provinceId') provinceId: number) {
    return this.addressService.getDistricts(provinceId);
  }
  @Get('/:districtId/schools')
  @ApiParam({ type: Number, required: true, name: 'districtId' })
  @ApiOperation({ description: 'Lấy danh sách các trường trong huyện' })
  getSchools(@Param('districtId') districtId: number) {
    return this.addressService.getSchools(districtId);
  }
}
