import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { Model, Types } from 'mongoose';
import { UpdateUserAddressInput } from '@libs/users/types';
import { UsersHelper } from '@helpers/users.helper';
import { UserProfile } from '@dto/user';
import { Province } from '@entities/province.entity';
import { District } from '@entities/district.entity';
import { School } from '@entities/school.entity';
import { Cache } from 'cache-manager';
import { AddressService } from '@libs/address/address.service';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userHelper: UsersHelper,
    private readonly addressService: AddressService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async changeUserAddress(
    input: UpdateUserAddressInput,
  ): Promise<UserProfile> {
    const { currentUser, provinceId, districtId, schoolId, grade } = input;
    if (grade <= 0) throw new BadRequestException('Grade invalid');
    const school = await this.addressService.findSchool(schoolId);
    if (school.province !== provinceId && school.district !== districtId)
      throw new BadRequestException('School invalid');
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: Types.ObjectId(currentUser),
        },
        {
          $set: {
            address: {
              province: provinceId,
              district: districtId,
              school: schoolId,
              grade: grade,
            },
          },
        },
        {
          new: true,
        },
      )
      .populate('address.province', ['-__v'], Province.name)
      .populate('address.district', ['-__v'], District.name)
      .populate('address.school', ['-__v'], School.name);
    const userProfile = this.userHelper.mapToUserProfile(user);
    await this.cacheManager.set<UserProfile>(
      `profile/${currentUser}`,
      userProfile,
      {
        ttl: 7200,
      },
    );

    return userProfile;
  }
}
