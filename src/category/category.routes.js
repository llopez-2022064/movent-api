'use strict'

import express, { Router } from 'express'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createCategory, deleteCategory, getCategories, updateCategory } from './category.controller.js'

const api = Router()

api.post('/', [validateJwt], createCategory)
api.put('/:id', [validateJwt], updateCategory)
api.get('/', [validateJwt], getCategories)
api.delete('/:id', [validateJwt], deleteCategory)

export default api