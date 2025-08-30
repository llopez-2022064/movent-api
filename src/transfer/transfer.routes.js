import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createTransfer, editTransfer } from "./transfer.controller.js";

const api = Router()

api.post('/', [validateJwt], createTransfer)
api.patch('/:id', [validateJwt], editTransfer)

export default api