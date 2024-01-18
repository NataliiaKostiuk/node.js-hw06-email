import {Schema, model} from "mongoose";
import Joi from "joi";
import { handleSaveError, addUpdateSettings } from './hooks.js';
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


const userSchema = new Schema({

  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
     required: [true, 'Email is required'],
     match: emailRegexp,
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
  },
  avatarURL: {
    type: String,
  },
   verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
    
}, {versionKey: false, timestamps: true})

userSchema.post('save', handleSaveError);

userSchema.pre('findOneAndUpdate',  addUpdateSettings);

userSchema.post('findOneAndUpdate', handleSaveError);

export const userRegisterSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

export const userEmailSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
})

const User = model("user", userSchema);

export default User;

   