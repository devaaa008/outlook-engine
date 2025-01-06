export interface IUser {
  id: string;
  email: string;
  outlookLinked: boolean;
  outlookAccessToken: string;
  outlookRefreshToken: string;
  outlookTokenExpiry: Date;
  lastEmailSyncedAt: Date;
}
