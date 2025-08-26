'use strict'

import { encrypt, validateFieldIsEmpty, verifyEmail, checkPassword } from '../utils/validator.js'
import User from './user.model.js'

export const updateUser = async (req, res) => {
    try {
        let userId = req.user.id
        let data = req.body

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'lastName', 'email'])
        if (!valid) return res.status(400).send({ msg: `${field} is empty` })

        let user = await User.findOneAndUpdate(
            { _id: userId },
            data,
            { new: true }
        ).select('-password')
        if (!user) return res.status(404).send({ msg: 'User not found and not updated' })

        return res.status(200).send({ msg: 'Update successful', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error updating user' })
    }
}

export const updatePassword = async (req, res) => {
    try {
        let { oldPassword, newPassword, confirmPassword } = req.body
        let user = req.user

        let { valid, field } = validateFieldIsEmpty(req.body, ['oldPassword', 'newPassword', 'confirmPassword'])
        if (!valid) return res.status(400).send({ msg: `${field} is empty` })

        let isCorrect = await checkPassword(oldPassword, user.password)
        if (!isCorrect) return res.status(400).send({ msg: 'Old password incorrect' })

        if (newPassword.length < 8) return res.status(400).send({ msg: 'The password must contain at least 8 digits' })

        if (newPassword !== confirmPassword) return res.status(400).send({ msg: 'New password and confirm password do not match' })

        user.password = await encrypt(newPassword)
        await user.save()

        return res.status(200).send({ msg: 'Password successfully updated' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error updating password' })
    }
}

export const getProfile = async (req, res) => {
    try {
        let userId = req.user.id

        let user = await User.findById(userId).select('-password')
        if (!user) return res.status(404).send({ msg: 'Profile not found' })

        return res.status(200).send({ user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error obtaining profile' })
    }
}