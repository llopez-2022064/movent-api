import Account from './account.model.js'
import { validateFieldIsEmpty, isNumber } from '../utils/validator.js'

export const addAccount = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        let existsAccountName = await Account.findOne({ name: data.name })
        if (existsAccountName) return res.status(400).send({ msg: 'There is already an account with that name' })

        let accounts = await Account.find({ user: user.id })
        if (accounts.length == 5) return res.status(409).send({ msg: 'You can only have a maximum of 5 accounts' })

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'category', 'user'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (data.openingBalance !== undefined && !isNumber(data.openingBalance)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' });
        }

        let account = new Account({ ...data, user: user.id })
        await account.save()

        return res.status(201).send({ msg: 'The account was successfully added', account })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error adding account' })
    }
}

export const updateAccount = async (req, res) => {
    try {
        let data = req.body
        let user = req.user
        let { id } = req.params

        let account = await Account.findOne({ _id: id })
        if (!account) return res.status(404).send({ msg: 'The account does not exist' })

        let existsAccountName = await Account.findOne({ name: data.name, _id: { $ne: id } })
        if (existsAccountName) return res.status(400).send({ msg: 'There is already an account with that name' })

        if (data.openingBalance !== undefined && !isNumber(data.openingBalance)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect' });
        }

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'category'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        let accountUpdate = await Account.findOneAndUpdate(
            { _id: id, user: user.id },
            data,
            { new: true }
        )
        if (!accountUpdate) return res.status(404).send({ msg: 'The account does not exist or you are not allowed to update it' })

        return res.status(200).send({ msg: 'The account has been successfully updated', accountUpdate })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error updating an account' })
    }
}

export const deleteAccount = async (req, res) => {
    try {
        let { id } = req.params
        let user = req.user

        let account = await Account.findOneAndDelete({ _id: id, user: req.user.id })
        if (!account) return res.status(404).send({ msg: 'Accoutn not found' })

        return res.status(200).send({ msg: 'Account successfully deleted' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error deleting an account' })
    }
}