import User from '../user/user.model.js'
import Expense from './expense.model.js'
import Account from '../account/account.model.js'
import { isNumber, validateFieldIsEmpty } from '../utils/validator.js'

export const createExpense = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'amount', 'account'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero.' })

        let account = await Account.findOne({ _id: data.account, user: user.id })
        if (!account) return res.status(404).send({ msg: 'Account not found' })

        if (account.openingBalance < data.amount) return res.status(400).send({ msg: 'Insufficient balance in account' })

        let expense = new Expense({ ...data, user: user.id })
        await expense.save()

        account.openingBalance -= data.amount
        await account.save()

        return res.status(201).send({ msg: 'Expense registered successfully', expense })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error adding an expense' })
    }
}

export const editExpense = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let user = req.user

        let expense = await Expense.findOne({ _id: id, user: user.id })
        if (!expense) return res.status(404).send({ msg: 'Expense not found' })

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'amount', 'account'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero' })
        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        let newAccount = await Account.findOne({ _id: data.account, user: user.id })
        if (!newAccount) return res.status(404).send({ msg: 'Account not found' })

        //Devolver saldo a la cuenta anterior
        let previousAccount = await Account.findOne({ _id: expense.account, user: user.id })
        if (previousAccount) {
            previousAccount.openingBalance += expense.amount
            await previousAccount.save()
        }

        if (newAccount.openingBalance < data.amount) {
            return res.status(400).send({ msg: 'Insufficient balance in account' })
        }

        //Descontar de la nueva cuenta
        newAccount.openingBalance -= data.amount
        await newAccount.save()

        let expenseUpdate = await Expense.findByIdAndUpdate(
            { _id: id },
            data,
            { new: true }
        )

        if (!expenseUpdate) return res.status(404).send({ msg: 'Expense not found and not updated' })

        return res.status(200).send({
            msg: 'Expense updated successfully',
            expense: expenseUpdate,
            accounts: {
                previous: previousAccount,
                current: newAccount
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error when editing the expense' })
    }
}
