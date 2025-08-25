'use strict'

import jwt from 'jsonwebtoken'

export const generateToken = async(payload) => {
    try {
        return jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: '8h',
            algorithm: 'HS256'
        })
    } catch (error) {
        console.error(error)
    }
}