import express from "express";

import contactsControllers from '../../controllers/contactsControllers.js';

import {authenticate, isEmptyBody, isValidId } from "../../middlewares/index.js";

import {validateBody} from '../../decorators/index.js'

import { contactAddSchema, contactUpdateSchema, contactUpdFavoriteSchema  } from "../../models/contacts.js";


const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', contactsControllers.getAll);

contactsRouter.get('/:id', isValidId, contactsControllers.getById);

contactsRouter.post('/',isEmptyBody, validateBody(contactAddSchema), contactsControllers.postContacts);

contactsRouter.delete('/:id', isValidId, contactsControllers.deleteById);

contactsRouter.put('/:id',  isValidId, isEmptyBody,validateBody(contactUpdateSchema), contactsControllers.updateById);

contactsRouter.patch('/:id/favorite', isValidId, isEmptyBody, validateBody(contactUpdFavoriteSchema), contactsControllers.updateStatusContact);


export default contactsRouter;
