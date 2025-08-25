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

export const updateCategory = async (req, res) => {
    try {
        let data = req.body
        let userId = req.user.id
        let { id } = req.params

        let category = await Category.findOne({ _id: id })
        if (!category) return res.status(404).send({ msg: 'Category not found' })

        let user = await User.findOne({ _id: userId })
        if (!user) return res.status(404).send({ msg: 'User not found' })

        let { valid, field } = validateFieldIsEmpty(data, ['name'])
        if (!valid) return res.status(400).send({ msg: '${field} is required' })

        let existsCategory = await Category.findOne({ name: data.name, user: userId, _id: { $ne: id} })
        if (existsCategory) return res.status(400).send({ msg: 'There is already a category with the same name' })

        let categoryUpdate = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )

        return res.status(200).send({ msg: categoryUpdate })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error updating category' })
    }
}