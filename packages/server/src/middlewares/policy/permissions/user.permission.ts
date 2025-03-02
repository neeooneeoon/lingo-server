import { JwtPayLoad } from '@utils/types/index';
import { Action } from '@utils/enums';
import { AppAbility } from '@middlewares/casl/casl-ability.factory';
import { IPolicyHandler } from '../policy.config';

export class UserPermission implements IPolicyHandler {
  private readonly permission: Action;

  constructor(permission: Action) {
    this.permission = permission;
  }

  handle(ability: AppAbility): boolean {
    return ability.can(this.permission, JwtPayLoad);
  }
}
