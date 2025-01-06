export interface IEmail {
    id?: string;
    userId: string;
    subject: string;
    from: string;
    to: string;
    body: string;
    receivedAt: Date;
}