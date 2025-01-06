import {MicrosoftAuthService} from "./MicrosoftAuthService";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {IUserRepository} from "../repositories/interfaces/IUserRepository";
import {IUser} from "../interfaces/IUser";

@injectable()
export class TokenService {
    constructor(@inject(TYPES.IUserRepository)private readonly userRepository: IUserRepository,@inject(TYPES.MicrosoftAuthService)private readonly microsoftAuthService: MicrosoftAuthService) {}

    async refreshOutlookToken(user:IUser): Promise<void> {
        const tokens = await this.microsoftAuthService.refreshToken(user.outlookRefreshToken);
        user.outlookAccessToken = tokens.accessToken;
        user.outlookRefreshToken = tokens.refreshToken;
        user.outlookTokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);

        await this.userRepository.updateUser(user.id, user);
    }
}