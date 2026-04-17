import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}
