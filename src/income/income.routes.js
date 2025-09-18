import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { addIncome, getIncomes } from "./income.controller.js";

const api = Router()

api.post('/', [validateJwt], addIncome)
api.get('/', [validateJwt], getIncomes)

export default api