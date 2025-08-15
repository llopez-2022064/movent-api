import { register } from "./user.controller.js";
import express from 'express'

const api = express.Router()

api.post('/', register)

export default api