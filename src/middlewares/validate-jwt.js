'use strict'

import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'
import { compare } from 'bcrypt'

export const validateJwt = async (req, res, next) => {
    try {
        let { token } = req.headers
        if (!token) return res.status(401).send({ msg: 'Unauthorized' })
        let { uid } = jwt.verify(token, process.env.SECRET_KEY)
        let user = await User.findOne({ _id: uid })
        if (!user) return res.status(404).send({ msg: 'User not found' })
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).send({ msg: 'Unauthorized' })
    }
}