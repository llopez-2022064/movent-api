import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createExpense, deleteExpense, editExpense, getExpenses } from "./expense.controller.js";

const api = Router()

api.post('/', [validateJwt], createExpense)
api.patch('/:id', [validateJwt], editExpense)
api.delete('/:id', [validateJwt], deleteExpense)
api.get('/', [validateJwt], getExpenses)

export default api