import { IUser } from "../../interfaces/IUser";

export interface IUserService {
  createUserWithOutlookLinked(
    email: string,
    tokens: any
  ): Promise<IUser>;
}
