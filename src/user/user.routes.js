import { getProfile, updatePassword, updateUser } from "./user.controller.js";
import { validateJwt } from "../middlewares/validate-jwt.js";
import express from 'express'

const api = express.Router()

api.put('/:id', [validateJwt], updateUser)
api.patch('/', [validateJwt], updatePassword)
api.get('/profile', [validateJwt], getProfile)

export default api