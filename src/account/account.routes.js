import { Router } from 'express'
import { addAccount, updateAccount } from './account.controller.js'
import { validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/', [validateJwt], addAccount)
api.patch('/:id', [validateJwt], updateAccount)

export default api