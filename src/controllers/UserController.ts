import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { IUserService } from "../services/interfaces/IUserService";
import { TYPES } from "../di/types";
import { MicrosoftAuthService } from "../services/MicrosoftAuthService";
import {IEmailService} from "../services/interfaces/IEmailService";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.MicrosoftAuthService)
    private msAuthService: MicrosoftAuthService,
    @inject(TYPES.IEmailService) private emailService: IEmailService,
  ) {}

  public async registerAndLinkOutlook(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const state = this.msAuthService.generateState();
      const authUrl = this.msAuthService.getAuthorizationUrl(state);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error in registration process:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async handleOAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;


      // Exchange code for tokens
      const tokens = await this.msAuthService.getTokensFromCode(code as string);
      const email=await this.msAuthService.getUserEmailAddress(tokens.access_token);

      const user = await this.userService.createUserWithOutlookLinked(
        email,
        tokens
      );

      await this.emailService.syncEmails(user,false)

      // Clear pending registration from session
      delete req.session.pendingRegistration;

      res.status(201).json({
        message: "User registered and Outlook linked successfully",
        userId: user.id,
      });
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
