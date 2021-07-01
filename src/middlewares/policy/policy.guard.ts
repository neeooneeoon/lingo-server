import { AppAbility, CaslAbilityFactory } from '@middlewares/casl/casl-ability.factory';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyHandler } from './policy.config';

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly caslAbilityFactory: CaslAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers =
            this.reflector.get<PolicyHandler[]>(
                process.env.CHECK_POLICIES_KEY,
                context.getHandler(),
            ) || [];

        const { user } = context.switchToHttp().getRequest();
        const ability = this.caslAbilityFactory.createForUser(user);

        return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability))
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === "function") {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}
