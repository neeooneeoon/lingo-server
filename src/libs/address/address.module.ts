import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Province, ProvinceSchema } from '@entities/province.entity';
import { District, DistrictSchema } from '@entities/district.entity';
import { AddressController } from '@libs/address/address.controller';
import { AddressService } from '@libs/address/address.service';
import { School, SchoolSchema } from '@entities/school.entity';
import { CacheModule } from '@cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Province.name, schema: ProvinceSchema },
      { name: District.name, schema: DistrictSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    CacheModule,
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
