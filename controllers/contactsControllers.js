
import {HttpError} from "../helpers/index.js";
import { controllerWrapper } from "../decorators/index.js";
import Contact from "../models/contacts.js";



async function getAll(req, res) {
  const { _id: owner } = req.user;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, '-createdAt -updatedAt', { skip, limit }).populate("owner", "email");
    res.json(result); 
}

async function getById  (req, res ) { 
  const { id: _id } = req.params;
   const {_id: owner} = req.user;
    const result = await Contact.findOne(_id, owner);
    if (!result) {
      throw HttpError(404, `Contact with id=${id} not found`);
    }
    res.json(result);  
}

async function postContacts(req, res) {
  console.log(req.user);
  const {_id: owner} = req.user;
    const result = await Contact.create({...req.body, owner});

    res.status(201).json(result) 
}

async function deleteById (req, res) {
    const { id: _id } = req.params;
   const {_id: owner} = req.user;
    const result = await Contact.findOneAndDelete(_id, owner);
    if (!result) {
      throw HttpError(404, `Contact with id = ${id} not found`);
    } 
     res.json(result)  
} 


async function updateById(req, res) {
  const { id: _id } = req.params;
   const {_id: owner} = req.user;
  const result = await Contact.findOneAndUpdate({_id, owner}, req.body);
  if (!result) {
    throw  HttpError(404, `Contact with id=${id} not found`)
  }
  res.json(result);   
}

async function updateStatusContact(req, res) {
   const { error } = contactUpdFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "Missing field favorite");
    }
  const { id } = req.params;
  const result = await Contact.findByIdAndUpdate(id, req.body)
   if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`)
  }
  res.json(result);   

}

export default {
    getAll: controllerWrapper(getAll),
    getById: controllerWrapper(getById),
    postContacts: controllerWrapper(postContacts),
    deleteById: controllerWrapper(deleteById),
    updateById: controllerWrapper(updateById),
    updateStatusContact: controllerWrapper(updateStatusContact),
    
}


