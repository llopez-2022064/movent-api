import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createTransfer } from "./transfer.controller.js";

const api = Router()

api.post('/', [validateJwt], createTransfer)

export default api