import {IEmail} from "../../interfaces/IEmail";

export interface IEmailRepository {
    saveEmail(email: IEmail,userId:string): Promise<IEmail>;
    // getEmailsByUserId(userId: string): Promise<IEmail[]>;
    // searchEmails(userId: string, query: string): Promise<IEmail[]>;
}