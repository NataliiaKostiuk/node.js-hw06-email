import { HttpError } from "../helpers/index.js";
import { controllerWrapper } from "../decorators/index.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from 'gravatar';
import fs from "fs/promises";
import path from "path";
import jimp from "jimp"

const avatarsPath = path.resolve("public", "avatars");


const {JWT_SECRET} = process.env;

const register = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avaratURL = gravatar.url(email)
    const newUser = await User.create({...req.body, password: hashPassword, avaratURL});
    res.status(201).json({
        user: {
            email: newUser.email,
            subscription: newUser.subscription,
             avaratURL ,
		},
	});
} 
 
const login = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password invalid");
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
    login: controllerWrapper(login),
    getCurrent: controllerWrapper(getCurrent),
    logout: controllerWrapper(logout),
    getAvatar: controllerWrapper(getAvatar),
    
}