import {IUser} from "../../interfaces/IUser";

export interface IEmailService {
    syncEmails(user:IUser,latest:boolean): Promise<void>;
}