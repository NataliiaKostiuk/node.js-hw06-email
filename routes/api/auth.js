import express from "express";

import usersControllers from '../../controllers/usersControllers.js';

import { isEmptyBody, authenticate, upload} from "../../middlewares/index.js";

import { userRegisterSchema, userEmailSchema } from "../../models/user.js";

import validateBody from "../../decorators/isValideBody.js";


const authRouter = express.Router();
 
authRouter.post("/register", isEmptyBody, validateBody(userRegisterSchema), usersControllers.register);
 
authRouter.get("/verify/:verificationToken", usersControllers.verify);

authRouter.post("/verify", isEmptyBody, validateBody(userEmailSchema), usersControllers.resendVerify);

authRouter.post("/login", isEmptyBody, validateBody(userRegisterSchema), usersControllers.login);
 
authRouter.get("/current", authenticate, usersControllers.getCurrent);

authRouter.post("/logout", authenticate, usersControllers.logout);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), usersControllers.getAvatar)

export default authRouter;