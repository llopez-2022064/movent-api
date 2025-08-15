'use strict'

import { encrypt, validateFieldIsEmpty, verifyEmail } from '../utils/validator.js'
import User from './user.model.js'

export const register = async (req, res) => {
    try {
        let data = req.body

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'lastName', 'email', 'password'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (!verifyEmail(data.email)) return res.status(400).send({ msg: 'Invalid email format' })

        let isExistsEmail = await User.findOne({ email: data.email })
        if (isExistsEmail) return res.status(409).send({ msg: 'Email already exists' })

        if(!data.password || data.password.length < 8 ) return res.status(400).send({msg: 'The password must contain at least 8 digits'})
        
        data.password = await encrypt(data.password)

        let user = new User(data)
        await user.save()

        return res.send({ msg: 'Registered successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error registering user' })
    }
}