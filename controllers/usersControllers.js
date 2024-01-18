
import { HttpError, sendEmail } from "../helpers/index.js";
import { controllerWrapper } from "../decorators/index.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from 'gravatar';
import fs from "fs/promises";
import path from "path";
import jimp from "jimp";
import { nanoid } from "nanoid";

const avatarsPath = path.resolve("public", "avatars");


const {JWT_SECRET,BASE_URL} = process.env;

const register = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
  const avaratURL = gravatar.url(email);
    const verificationToken = nanoid();
  const newUser = await User.create({ ...req.body, password: hashPassword, avaratURL, verificationToken });
     const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);
    res.status(201).json({
        user: {
            email: newUser.email,
            subscription: newUser.subscription,
             avaratURL ,
		},
	});
} 
 

const verify = async(req, res)=> {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if(!user) {
        throw HttpError(400, "Email invalid or alredy verify");
    }
    await User.findByIdAndUpdate(user._id, {verify: true, verificationToken: ""});

    res.json({
        message: "Email verify"
    })

    
}

const resendVerify = async(req, res)=> {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(404, "Email invalid");
    }

    if(user.verify) {
        throw HttpError(404, "Email already verify");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);

    res.json({
        message: "Email send success"
    })
}



const login = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password invalid");
    }
    if(!user.verify) {
        throw HttpError(401, "Email not verify");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }
    const {_id: id} = user;
    const payload = {
        id
    };

    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "23h"});
     await User.findByIdAndUpdate(id, {token});

    res.json({
        token,
        		user: {
            email: user.email,
             subscription: user.subscription,
		},
    })
}

const getCurrent = async(req, res)=> {
    const { email, subscription } = req.user;

    res.json({ 
        email,
        subscription
    })
}

const logout = async(req, res)=> {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});

    res.json({
        message: "Logout success"
    })
}


const getAvatar =async (req, res) => {

  if (!req.file) {
		throw HttpError(400, 'Error loading avatar');
	}

  const { path: tempUpload, originalname } = req.file;

  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;

  try {
    const resultUpload = path.join(avatarsPath, imageName);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("public", "avatars", imageName);

    jimp.read(avatarURL, (error, imageName) => {
      if (error) throw error;
      imageName.resize(250, 250).write(avatarURL);
    });

    await User.findByIdAndUpdate(id, { avatarURL });
    res.json({
      avatarURL,
    });
  } catch (error) {
    await fs.unlink(tempUpload);
    throw error;
  }
};

export default {
    register: controllerWrapper(register),
    verify: controllerWrapper(verify),
    resendVerify: controllerWrapper(resendVerify),
    login: controllerWrapper(login),
    getCurrent: controllerWrapper(getCurrent),
    logout: controllerWrapper(logout),
    getAvatar: controllerWrapper(getAvatar),
    
}