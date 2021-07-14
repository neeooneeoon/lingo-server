import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Province, ProvinceDocument } from '@entities/province.entity';
import { Model } from 'mongoose';
import { District, DistrictDocument } from '@entities/district.entity';
import { from, Observable } from 'rxjs';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>,
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
  ) {}

  public getProvinces(): Observable<ProvinceDocument[]> {
    return from(this.provinceModel.find()).pipe();
  }

  public getDistricts(provinceId: number): Observable<DistrictDocument[]> {
    return from(
      this.districtModel.find({ province: provinceId }).select('-province'),
    );
  }
}
