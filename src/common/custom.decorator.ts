import { createParamDecorator, ExecutionContext } from '@nestjs/common';


export const UserCtx = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        const user = request.user
        delete user.password
        return user;
    }
)