import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createExpense, editExpense } from "./expense.controller.js";

const api = Router()

api.post('/', [validateJwt], createExpense)
api.patch('/:id', [validateJwt], editExpense)

export default api