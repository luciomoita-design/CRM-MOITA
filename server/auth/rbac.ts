import { Role } from '@prisma/client';

export type Action =
  | 'read:all'
  | 'write:config'
  | 'manage:pipeline'
  | 'manage:members'
  | 'manage:webhook';

const roleMatrix: Record<Role, Action[]> = {
  admin: ['read:all', 'write:config', 'manage:pipeline', 'manage:members', 'manage:webhook'],
  manager: ['read:all', 'manage:pipeline', 'manage:webhook'],
  rep: ['read:all']
};

export function can(role: Role, action: Action) {
  return roleMatrix[role]?.includes(action) ?? false;
}
