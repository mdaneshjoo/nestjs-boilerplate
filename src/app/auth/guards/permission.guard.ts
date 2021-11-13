import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission_KEY } from '../../../shared/decorator/permission-api.decorator';
import { PermissionsEnum } from '../../roles/permissions.enum';
import { AuthService } from '../auth.service';
import { PayloadInterface } from '../interfaces/auth.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionsEnum[]
    >(Permission_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest() as {
      user: PayloadInterface;
    };
    const permissions = this.authService.getUserPermissions(user);
    if (permissions.includes(PermissionsEnum.MANAGE)) return true;
    return requiredPermissions.some((permission) =>
      permissions?.includes(permission),
    );
  }
}
