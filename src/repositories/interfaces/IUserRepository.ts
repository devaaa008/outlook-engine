import { IUser } from "../../interfaces/IUser";

export interface IUserRepository {
  createUser(user: IUser): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: string, updates: Partial<IUser>): Promise<IUser>;
  getAllUsers():  Promise<IUser[]>
}
