import { Container } from "inversify";
import { TYPES } from "./types";
import { IUserService } from "../services/interfaces/IUserService";
import { UserService } from "../services/UserService";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { UserController } from "../controllers/UserController";
import { MicrosoftAuthService } from "../services/MicrosoftAuthService";
import { Client } from "@elastic/elasticsearch";
import * as fs from "node:fs";
import {IEmailRepository} from "../repositories/interfaces/IEmailRepository";
import {EmailRepository} from "../repositories/EmailRepository";
import {EmailService} from "../services/EmailService";
import {IEmailService} from "../services/interfaces/IEmailService";
import {TokenService} from "../services/TokenService";
import {EmailSyncJob} from "../services/EmailSyncJob";

const container = new Container();

container.bind<Client>(TYPES.ElasticsearchClient).toConstantValue(
    new Client({
        node: "https://elastic:rxZIURHbhmKaV8Wp2qxu@localhost:9200",
        tls: {
            ca: fs.readFileSync("./certs/http_ca.crt"),
            rejectUnauthorized: false,
        }})
);

container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IEmailRepository>(TYPES.IEmailRepository).to(EmailRepository);
container.bind<IEmailService>(TYPES.IEmailService).to(EmailService);
container.bind<UserController>(UserController).toSelf();
container.bind<EmailSyncJob>(EmailSyncJob).toSelf()
container
  .bind<MicrosoftAuthService>(TYPES.MicrosoftAuthService)
  .to(MicrosoftAuthService);
container.bind<TokenService>(TYPES.TokenService).to(TokenService);

export { container };
