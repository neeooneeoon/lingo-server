import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Province, ProvinceDocument } from '@entities/province.entity';
import { Model } from 'mongoose';
import { District, DistrictDocument } from '@entities/district.entity';
import { School, SchoolDocument } from '@entities/school.entity';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';

@Injectable()
export class AddressService {
  private prefixKey: string;
  constructor(
    @InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>,
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async getProvinces(): Promise<ProvinceDocument[]> {
    try {
      const cacheProvinces = await this.cacheManager.get<ProvinceDocument[]>(
        `${this.prefixKey}/address/provinces`,
      );
      if (cacheProvinces) return cacheProvinces;
      const provinces = await this.provinceModel.find().sort({ name: 1 });
      await this.cacheManager.set<ProvinceDocument[]>(
        `${this.prefixKey}/address/provinces`,
        provinces,
        { ttl: 21600 },
      );
      return provinces;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getDistricts(provinceId: number): Promise<DistrictDocument[]> {
    try {
      const cacheDistricts = await this.cacheManager.get<DistrictDocument[]>(
        `${this.prefixKey}/address/${provinceId}'/districts`,
      );
      if (cacheDistricts) return cacheDistricts;
      const districts = await this.districtModel
        .find({ province: provinceId })
        .select(['-province'])
        .sort({ name: 1 });
      await this.cacheManager.set<DistrictDocument[]>(
        `${this.prefixKey}/address/${provinceId}'/districts`,
        districts,
        { ttl: 14400 },
      );
      return districts;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getSchools(districtId: number): Promise<SchoolDocument[]> {
    try {
      const cacheSchools = await this.cacheManager.get<SchoolDocument[]>(
        `${this.prefixKey}/address/${districtId}/schools`,
      );
      if (cacheSchools) return cacheSchools;
      const schools = await this.schoolModel
        .find({ district: districtId })
        .select(['-province', '-district'])
        .sort({ name: 1 });
      await this.cacheManager.set<SchoolDocument[]>(
        `${this.prefixKey}/address/${districtId}/schools`,
        schools,
        { ttl: 7200 },
      );
      return schools;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async findSchool(schoolId: number): Promise<SchoolDocument> {
    const school = await this.schoolModel.findById(schoolId);
    if (!school) throw new NotFoundException(`School ${schoolId} not found.`);
    return school;
  }
}
