import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const CurrentUser = (...args: string[]) => SetMetadata('current-user', args);
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    return 'test';
  },
);
