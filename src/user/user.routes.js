import { login, register } from "./user.controller.js";
import express from 'express'

const api = express.Router()

api.post('/register', register)
api.post('/login', login)

export default api