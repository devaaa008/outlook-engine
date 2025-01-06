import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();
import { config } from "./config/config";
import userRoutes from "./routes/userRoutes";
import {container} from "./di/container";
import {EmailSyncJob} from "./services/EmailSyncJob";

const app = express();
app.use(bodyParser.json())


app.use("/auth", userRoutes);
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});

const emailSyncJob= container.get<EmailSyncJob>(EmailSyncJob)
emailSyncJob.start()