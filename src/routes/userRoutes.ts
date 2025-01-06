import { Router } from "express";
import { container } from "../di/container";
import { UserController } from "../controllers/UserController";

const userRoutes = Router();
const userController = container.get<UserController>(UserController);

userRoutes.get("/register", (req, res) =>
  userController.registerAndLinkOutlook(req, res)
);
userRoutes.get("/callback", (req, res) =>
  userController.handleOAuthCallback(req, res)
);

export default userRoutes;
