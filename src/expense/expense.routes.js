import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createExpense } from "./expense.controller.js";

const api = Router()

api.post('/', [validateJwt], createExpense)

export default api