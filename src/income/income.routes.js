import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { addIncome } from "./income.controller.js";

const api = Router()

api.post('/', [validateJwt], addIncome)

export default api