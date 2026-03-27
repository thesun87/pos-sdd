import type { User, Session, Account, UserRole, UserStoreAssignment, Role } from '@prisma/client';

/**
 * Session với đầy đủ thông tin user, roles và store assignments
 * Prisma 7.x dùng snake_case field names (theo @map definitions)
 */
export type SessionWithUser = Session & {
  user: User & {
    user_roles: (UserRole & { role: Role })[];
    store_assignments: UserStoreAssignment[];
  };
};

/**
 * Account với thông tin user liên kết
 */
export type AccountWithUser = Account & {
  user: User;
};
