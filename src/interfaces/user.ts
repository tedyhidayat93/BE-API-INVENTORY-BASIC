import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../db/schema/users.js';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserRole = 'admin' | 'staff';

export interface UserWithToken extends User {
  token: string;
  refreshToken: string;
}