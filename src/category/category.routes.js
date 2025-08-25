'use strict'

import express, { Router } from 'express'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { createCategory, getCategories, updateCategory } from './category.controller.js'

const api = Router()

api.post('/', [validateJwt], createCategory)
api.put('/:id', [validateJwt], updateCategory)
api.get('/', [validateJwt], getCategories)

export default api