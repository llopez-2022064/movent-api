import { Router } from 'express'
import { addAccount, deleteAccount, getAccounts, updateAccount } from './account.controller.js'
import { validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/', [validateJwt], addAccount)
api.patch('/:id', [validateJwt], updateAccount)
api.delete('/:id', [validateJwt], deleteAccount)
api.get('/', [validateJwt], getAccounts)

export default api