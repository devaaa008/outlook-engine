import { injectable, inject } from "inversify";
import { IUserService } from "./interfaces/IUserService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IUser } from "../interfaces/IUser";
import { TYPES } from "../di/types";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {MicrosoftAuthService} from "./MicrosoftAuthService";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.MicrosoftAuthService) private microsoftAuthService: MicrosoftAuthService,
  ) {}

  public async createUserWithOutlookLinked(
    email: string,
    tokens: any
  ): Promise<IUser> {
    const existingUser=await this.userRepository.getUserByEmail(email)
    if(existingUser){ return existingUser }

    const userId = uuidv4();

    const user: IUser = {
      id: userId,
      email,
      outlookLinked: true,
      outlookAccessToken: tokens.access_token,
      outlookRefreshToken: tokens.refresh_token,
      outlookTokenExpiry: new Date(
        Date.now() + tokens.expires_in * 1000
      ),
      lastEmailSyncedAt: new Date()
    };

    await this.userRepository.createUser(user);
    return user;
  }

  // ... other methods ...
}
