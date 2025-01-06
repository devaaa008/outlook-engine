import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {EmailRepository} from "../repositories/EmailRepository";
import {IUserRepository} from "../repositories/interfaces/IUserRepository";
import {TokenService} from "./TokenService";
import axios from "axios";
import {IUser} from "../interfaces/IUser";
import {IEmailService} from "./interfaces/IEmailService";
import {IEmail} from "../interfaces/IEmail";

@injectable()
export class EmailService implements IEmailService {

    constructor(@inject(TYPES.IEmailRepository) private emailRepository: EmailRepository,
                @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
                @inject(TYPES.TokenService) private tokenService: TokenService) {
    }
    async syncEmails(user:IUser,latest:boolean): Promise<void> {
        if (!user || !user.outlookLinked) {
            throw new Error('User not found or Outlook not linked');
        }
        const dateTime=new Date(user.outlookTokenExpiry)
        if (new Date()>dateTime) {
            await this.tokenService.refreshOutlookToken(user);
        }

        const emails = await this.fetchOutlookEmails(user.outlookAccessToken,user,latest);
        await this.createAndIndexEmails(user.id,emails)
        await this.userRepository.updateUser(user.id, {...user,lastEmailSyncedAt:new Date()});
    }

    private async fetchOutlookEmails(accessToken: string,user:IUser,latest:boolean): Promise<IEmail[]> {
        const lastCheckTimeISO = user.lastEmailSyncedAt

        const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                $orderby: 'receivedDateTime desc',
                $select: 'id,subject,receivedDateTime,from,body,toRecipients',
                $top: 50,
                $filter: latest?`receivedDateTime ge ${lastCheckTimeISO}`:null
            }
        });

        return response.data.value.map((email:any) => ({
            userId: user.id,
            subject: email.subject,
            from: email.from.emailAddress.address,
            to: email.toRecipients.map((r:any) => r.emailAddress.address).join(', '),
            body: email.body.content,
            receivedAt: new Date(email.receivedDateTime),
        }));
    }

    private async createAndIndexEmails(userId:string,emails:IEmail[]) {
        const index_name=`email_${userId}`.toLowerCase()
        await this.emailRepository.createIndexIfNotExists(index_name)
        await this.emailRepository.bulkIndexEmails(index_name, emails);
    }

}