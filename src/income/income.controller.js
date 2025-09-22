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

export const updateIncome = async (req, res) => {
    try {
        let user = req.user
        let { id } = req.params
        let data = req.body

        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount is incorrect.' })
        }

        let income = await Income.findOne({ _id: id, user: user.id })
        if (!income) return res.status(404).send({ msg: 'Income not found' })

        let oldAccount = await Account.findOne({ _id: income.account, user: user.id })
        if (!oldAccount) return res.status(400).send({ msg: 'Old account not found' })

        let newAccountId = data.account || income.account
        let newAmount = data.amount !== undefined ? data.amount : income.amount

        if (String(oldAccount._id) !== String(newAccountId)) {
            // Cambio de cuenta
            oldAccount.openingBalance -= income.amount
            await oldAccount.save()

            let newAccount = await Account.findOne({ _id: newAccountId, user: user.id })
            if (!newAccount) return res.status(400).send({ msg: 'New account not found' })

            newAccount.openingBalance += newAmount
            await newAccount.save()
        } else if (income.amount !== newAmount) {
            // Misma cuenta, pero cambio el monto
            let difference = newAmount - income.amount
            oldAccount.openingBalance += difference
            await oldAccount.save()
        }

        let updatedIncome = await Income.findOneAndUpdate(
            { _id: id, user: user.id },
            data,
            { new: true }
        )

        return res.status(200).send({ msg: 'Income updated successfully', updatedIncome })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error updating income' })
    }
}

export const getIncomes = async (req, res) => {
    try {
        let user = req.user
        let incomes = await Income.find({ user: user.id })
            .populate('account', 'name openingBalance category')
            .populate('user', 'name lastName')

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

export const getMonthlyIncome = async (req, res) => {
    try {
        let user = req.user

        const startOfMonth = dayjs().startOf("month").toDate()
        const endOfMonth = dayjs().endOf("month").toDate()

        let incomes = await Income.find({
            user: user.id,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        })

        const totalIncomes = incomes.reduce((inc, e) => inc += e.amount, 0)

        return res.status(200).send({ totalIncomes })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Server Error' })
    }
}