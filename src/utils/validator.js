import { hash, compare } from "bcrypt"

export const verifyEmail = (email) => {
    try {
        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return regex.test(email)
    } catch (error) {
        return false
    }
}

export const validateFieldIsEmpty = (data, fields) => {
    for (let field of fields) {
        if (data.hasOwnProperty(field)) {
            if (!data[field] || !data[field].toString().trim()) {
                return { valid: false, field }
            }
        }
    }
    return { valid: true }
}

export const encrypt = async (password) => {
    try {
        return hash(password, 10)
    } catch (error) {
        return error
    }
}

export const checkPassword = async (password, hash) => {
    try {
        return await compare(password, hash)
    } catch (error) {
        console.error(error)
        return error
    }
}