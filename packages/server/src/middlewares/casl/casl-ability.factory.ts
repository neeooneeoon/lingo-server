import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UserProfile } from '@dto/user';
import { JwtPayLoad } from '@utils/types';
import { Role } from '@utils/enums';
import { Action } from '@utils/enums';

export type Subjects =
  | InferSubjects<typeof UserProfile | typeof JwtPayLoad>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtPayLoad) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    if (user.role === Role.Admin) {
      can(Action.Manage, 'all');
    } else {
      cannot(Action.Manage, 'all');
    }
    return build();
  }
}
