import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { Model, Types } from 'mongoose';
import { UpdateUserAddressInput } from '@libs/users/types';
import { map } from 'rxjs/operators';
import { UsersHelper } from '@helpers/users.helper';
import { UserProfile } from '@dto/user';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userHelper: UsersHelper,
  ) {}

  public changeUserAddress(
    input: UpdateUserAddressInput,
  ): Observable<UserProfile> {
    const unSelect = ['-address.province.__v', '-address.district.__v'];
    const { currentUser, provinceId, districtId } = input;
    return from(
      this.userModel
        .findOneAndUpdate(
          {
            _id: Types.ObjectId(currentUser),
          },
          {
            $set: {
              address: {
                province: provinceId,
                district: districtId,
              },
            },
          },
        )
        .populate('address.province')
        .populate('address.district')
        .select(unSelect),
    ).pipe(
      map((user) => {
        return this.userHelper.mapToUserProfile(user);
      }),
    );
  }
}
