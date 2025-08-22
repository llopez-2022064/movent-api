import { login, register, updateUser } from "./user.controller.js";
import { validateJwt } from "../middlewares/validate-jwt.js";
import express from 'express'

const api = express.Router()

// Public
api.post('/register', register)
api.post('/login', login)

// Private
api.put('/:id', [validateJwt], updateUser)

export default api