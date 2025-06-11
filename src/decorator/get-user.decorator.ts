import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const getUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): any => {
        const request: Express.Request = ctx.switchToHttp().getRequest();
        return request.user; // Assuming user is attached to the request object by a guard
    }
)