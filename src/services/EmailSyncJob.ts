import cron from 'node-cron';
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {IEmailService} from "./interfaces/IEmailService";
import {IUserRepository} from "../repositories/interfaces/IUserRepository"; // Adjust the import path as needed

@injectable()
export class EmailSyncJob {
    private isSyncing: boolean = false;

    constructor(@inject(TYPES.IEmailService) private emailService: IEmailService,@inject(TYPES.IUserRepository) private userRepository: IUserRepository) {

    }

    public start(): void {
        console.log('Starting email sync cron job');
        cron.schedule('*/5 * * * *', this.syncEmails.bind(this));
        this.syncEmails();
    }

    private async syncEmails(): Promise<void> {
        if (this.isSyncing) {
            console.log('Sync already in progress, skipping...');
            return;
        }
        this.isSyncing = true;
        console.log('Starting email sync:', new Date().toISOString());
        try {
            const users=await this.userRepository.getAllUsers()
            for (const user of users) {
                await this.emailService.syncEmails(user,true)
            }
            console.log('Email sync completed:', new Date().toISOString());
        } catch (error) {
            console.error('Error during email sync:', error);
        } finally {
            this.isSyncing = false;
        }
    }
}

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    process.exit();
});