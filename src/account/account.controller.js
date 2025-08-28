import Account from './account.model.js'
import { validateFieldIsEmpty, isNumber } from '../utils/validator.js'

export const addAccount = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        let accounts = await Account.find({ user: user.id })
        if (accounts.length == 5) return res.status(409).send({ msg: 'You can only have a maximum of 5 accounts' })

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'category', 'user'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (!isNumber(data.openingBalance)) return res.status(400).send({ msg: 'The amount entered is incorrect.' })

        let account = new Account({ ...data, user: user.id })
        await account.save()

        return res.status(201).send({ msg: 'The account was successfully added', account })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error adding account' })
    }
}