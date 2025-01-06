import { injectable } from "inversify";
import { AuthorizationCode } from "simple-oauth2";
import crypto from "crypto";
import {config} from "../config/config";
import axios from 'axios'
import {IUser} from "../interfaces/IUser";

@injectable()
export class MicrosoftAuthService {
  private client: AuthorizationCode;

  constructor() {
    this.client = new AuthorizationCode({
      client: {
        id: config.auth.clientId,
        secret: config.auth.clientSecret,
      },
      auth: {
        tokenHost: "https://login.microsoftonline.com",
        authorizePath: "/common/oauth2/v2.0/authorize",
        tokenPath: "/common/oauth2/v2.0/token",
      },
    });
  }

  public generateState(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  public getAuthorizationUrl(state: string): string {
    const authorizationUri = this.client.authorizeURL({
      redirect_uri: config.auth.redirectUri,
      scope: "offline_access user.read mail.read",
      state: state,
    });

    return authorizationUri;
  }

  public async getTokensFromCode(code: string): Promise<any> {
    const tokenParams = {
      code: code,
      redirect_uri: config.auth.redirectUri ||'',
      scope: "offline_access user.read mail.read",
    };

    const accessToken = await this.client.getToken(tokenParams);
    return accessToken.token;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const params = new URLSearchParams({
      client_id: config.auth.clientId,
      client_secret: config.auth.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await axios.post(tokenUrl, params);
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }

  async getUserEmailAddress(accessToken:string):Promise<string> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const userDetails = response.data;
      return userDetails.mail
    }
    catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }
}
