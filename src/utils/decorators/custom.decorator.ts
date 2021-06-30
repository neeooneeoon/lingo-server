import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayLoad } from "@utils/types";

type UserRequest = {
    user: JwtPayLoad
}

export const UserCtx = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<UserRequest>();
        const user = request.user;
        return user;
    }
);
