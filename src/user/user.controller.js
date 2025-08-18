'use strict'

import { generateToken } from '../utils/generateToken.js'
import { encrypt, validateFieldIsEmpty, verifyEmail, checkPassword } from '../utils/validator.js'
import User from './user.model.js'

export const register = async (req, res) => {
    try {
        let data = req.body

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'lastName', 'email', 'password'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (!verifyEmail(data.email)) return res.status(400).send({ msg: 'Invalid email format' })

        let isExistsEmail = await User.findOne({ email: data.email })
        if (isExistsEmail) return res.status(409).send({ msg: 'Email already exists' })

        if (!data.password || data.password.length < 8) return res.status(400).send({ msg: 'The password must contain at least 8 digits' })

        data.password = await encrypt(data.password)

        let user = new User(data)
        await user.save()

        return res.send({ msg: 'Registered successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error registering user' })
    }
}

export const login = async (req, res) => {
    try {
        let { email, password } = req.body

        let { valid, field } = validateFieldIsEmpty(req.body, ['email', 'password'])
        if (!valid) return res.status(400).send({ msg: `${field} is empty` })

        if (!verifyEmail(email)) return res.status(400).send({ msg: 'Invalid email format' })

        let user = await User.findOne({ email: email })

        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                name: user.name,
                email: user.email
            }

            let token = await generateToken(loggedUser)

            return res.send({
                msg: `Welcome ${loggedUser.name} to Movent`,
                loggedUser,
                token
            })
        }

        return res.status(404).send({ msg: 'Invalid credentials' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error logging in' })
    }
}