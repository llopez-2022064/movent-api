import Income from './income.model.js'
import Account from '../account/account.model.js'
import { isNumber, validateFieldIsEmpty } from '../utils/validator.js'
import dayjs from 'dayjs'

export const addIncome = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'account', 'amount'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        let account = await Account.findOne({ _id: data.account, user: user.id })
        if (!account) return res.status(400).send({ msg: 'Account not found' })

        if (!isNumber(data.amount)) return res.status(400).send({ msg: 'The amount is incorrect.' })

        account.openingBalance += data.amount
        await account.save()

        let income = new Income({
            ...data,
            user: user.id
        })
        await income.save()

        return res.status(201).send({ msg: 'Income registered successfully', income })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error entering income' })
    }
}

export const getIncomes = async (req, res) => {
    try {
        let user = req.user
        let incomes = await Income.find({ user: user.id })
            .populate('account', 'name openingBalance category')
            .populate('user', 'name lastName')

        if (!incomes.length) return res.status(404).send({ msg: 'No incomes found' })

        const formattedIncomes = incomes.map(inc => ({
            ...inc.toObject(),
            createdAt: dayjs(inc.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(inc.updatedAt).format('DD/MM/YYYY HH:mm')
        }))

        return res.status(200).send({ formattedIncomes })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error getting incomes' })
    }
}

export const deleteIncome = async (req, res) => {
    try {
        let user = req.user
        let { id } = req.params

        let income = await Income.findOne({ _id: id, user: user.id })
        if (!income) return res.status(404).send({ msg: 'Income not found' })

        let account = await Account.findOne({ _id: income.account, user: user.id })
        if (!account) return res.status(404).send({ msg: 'Account not found' })

        account.openingBalance -= income.amount
        await account.save()

        let deletedIncome = await Income.findByIdAndDelete(id)

        return res.status(200).send({ msg: 'Income deleted successfully', deletedIncome })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error deleting income' })
    }
}
