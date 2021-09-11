import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Province, ProvinceDocument } from '@entities/province.entity';
import { LeanDocument, Model } from 'mongoose';
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

  public async getProvinces(): Promise<LeanDocument<ProvinceDocument>[]> {
    try {
      const cacheProvinces = await this.cacheManager.get<ProvinceDocument[]>(
        `${this.prefixKey}/address/provinces`,
      );
      if (cacheProvinces) return cacheProvinces;
      const provinces = await this.provinceModel
        .find()
        .select(['_id', 'name'])
        .sort({ name: 1 })
        .lean();
      await this.cacheManager.set<LeanDocument<ProvinceDocument>[]>(
        `${this.prefixKey}/address/provinces`,
        provinces,
        { ttl: 7200 },
      );
      return provinces;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getDistricts(
    provinceId: number,
  ): Promise<LeanDocument<DistrictDocument>[]> {
    try {
      return this.districtModel
        .find({ province: provinceId })
        .select(['_id', 'name'])
        .sort({ name: 1 })
        .lean();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getSchools(
    districtId: number,
  ): Promise<LeanDocument<SchoolDocument>[]> {
    try {
      const schools = await this.schoolModel
        .find({ district: districtId })
        .select(['_id', 'name'])
        .sort({ name: 1 })
        .lean();
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

  public async resetProvinces() {
    const docs = await this.provinceModel.find();
    await this.provinceModel.deleteMany();
    await this.provinceModel.insertMany(docs);
  }

  public async resetDistricts() {
    const docs = await this.districtModel.find();
    await this.districtModel.deleteMany();
    await this.districtModel.insertMany(docs);
  }

  public async restSchools() {
    const docs = await this.schoolModel.find();
    await this.schoolModel.deleteMany();
    await this.schoolModel.insertMany(docs);
  }
}
