
import { Schema, model } from "mongoose";
import Joi from "joi";
import { handleSaveError,addUpdateSettings } from "./hooks.js";


const contactsSchema = new Schema({
    name: { type: String, required: [true, 'Set name for contact'] },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    favorite: { type: Boolean, default: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    }
}, { versionKey: false, timestamps: true });

contactsSchema.post('save', handleSaveError);

contactsSchema.pre('findOneAndUpdate', addUpdateSettings);

contactsSchema.post('findOneAndUpdate', handleSaveError);

export const contactAddSchema = Joi.object({
    name: Joi.string().required().messages({
   'any.required': '"name" must be  exist' 
    }),
    email: Joi.string().required().messages({
        'any.required': '"email" must be  exist' 
    }),
    phone: Joi.number().required().messages({
     'any.required': '"phone" must be  exist'    
    })
})

export const contactUpdFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
})
export const contactUpdateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
})

const Contact = model('contact', contactsSchema);


export default Contact;