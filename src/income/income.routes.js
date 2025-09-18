import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { addIncome, deleteIncome, getIncomes, getMonthlyIncome, updateIncome } from "./income.controller.js";

const api = Router()

api.post('/', [validateJwt], addIncome)
api.put('/:id', [validateJwt], updateIncome)
api.get('/', [validateJwt], getIncomes)
api.delete('/:id', [validateJwt], deleteIncome)
api.get('/monthly-income', [validateJwt], getMonthlyIncome)

export default api