import { Router } from 'express'
import { addAccount } from './account.controller.js'
import { validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/', [validateJwt], addAccount)

export default api