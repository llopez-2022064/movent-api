'use strict'

import Category from './category.model.js'
import User from '../user/user.model.js'
import { validateFieldIsEmpty } from '../utils/validator.js'

export const createCategory = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.user

        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).send({ msg: 'User not found' })

        let existsCategory = await Category.findOne({ name: data.name, user: id })
        if (existsCategory) return res.status(400).send({ msg: 'There is already a category with that name.' })

        let { valid, field } = validateFieldIsEmpty(data, ['name'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        let category = new Category({ ...data, user: id })
        await category.save()

        return res.status(201).send({ msg: 'Created successfully', category })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error creating category' })
    }
}
