import { Roles } from './entities/roles.entity';

export const ConstRoles: { Admin: Roles; User: Roles } = {
  Admin: {
    roleName: 'admin',
    description: 'this is admin role',
    createdBy: 0,
  },
  User: {
    roleName: 'user',
    description: 'this is user role',
    createdBy: 0,
  },
};
