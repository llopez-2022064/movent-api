import User from '../user/user.model.js'
import Expense from './expense.model.js'
import Account from '../account/account.model.js'
import Category from '../category/category.model.js'
import { isNumber, validateFieldIsEmpty } from '../utils/validator.js'
import dayjs from 'dayjs'

export const createExpense = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'amount', 'account', 'category'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero.' })

        let category = await Category.findOne({ _id: data.category, user: user.id })
        if (!category) return res.status(404).send({ msg: 'Category not found' })

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

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero' })

        let { valid, field } = validateFieldIsEmpty(data, ['name', 'amount', 'account', 'category'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        let category = await Category.findOne({ _id: data.category, user: user.id })
        if (!category) return res.status(404).send({ msg: 'Category not found' })

        let previousAccount = null
        let newAccount = null

        //Devolver saldo a la cuenta anterior
        previousAccount = await Account.findOne({ _id: expense.account, user: user.id })
        if (previousAccount) {
            previousAccount.openingBalance += expense.amount
            await previousAccount.save()
        }

        if (data.account && data.account !== String(expense.account)) {
            newAccount = await Account.findOne({ _id: data.account, user: user.id })
            if (!newAccount) return res.status(404).send({ msg: 'Account not found' })

            if (newAccount.openingBalance < data.amount) {
                return res.status(400).send({ msg: 'Insufficient balance in account' })
            }

            //Descontar de la nueva cuenta
            if (data.amount !== undefined) {
                newAccount.openingBalance -= data.amount
                await newAccount.save()
            }
        } else {
            newAccount = previousAccount
            if (data.amount !== undefined) {
                if (newAccount.openingBalance < data.amount) {
                    return res.status(400).send({ msg: 'Insufficient balance in account' })
                }
                newAccount.openingBalance -= data.amount
                await newAccount.save()
            }
        }

        let expenseUpdate = await Expense.findByIdAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('user', 'name lastName email')
            .populate('account', 'name openingBalance category')

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

export const deleteExpense = async (req, res) => {
    try {
        let { id } = req.params
        let user = req.user

        let expense = await Expense.findOne({ _id: id, user: user.id })
        if (!expense) return res.status(404).send({ msg: 'Expense not found' })

        let account = await Account.findOne({ _id: expense.account, user: user.id })
        if (account) {
            account.openingBalance += expense.amount
            await account.save()
        }

        await Expense.deleteOne({ _id: id, user: user.id })

        return res.status(200).send({
            msg: 'Expense successfully deleted',
            deletedExpense: expense,
            updatedAccount: account
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error deleting an expense' })
    }
}

export const getExpenses = async (req, res) => {
    try {
        let user = req.user

        let expenses = await Expense.find({ user: user.id })
            .populate('user', 'name lastName')
            .populate('account', 'name openingBalance category')
            .populate('category', 'name')
            .lean()
        if (expenses.length === 0) return res.status(404).send({ msg: 'There are currently no expenses' })

        const formattedExpenses = expenses.map(exp => ({
            ...exp,
            createdAt: dayjs(exp.createdAt).format('DD/MM/YYYY HH:mm'),
            updatedAt: dayjs(exp.updatedAt).format("DD/MM/YYYY HH:mm")
        }))

        return res.status(200).send({ formattedExpenses })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error retrieving all expenses' })
    }
}

export const getNExpenses = async (req, res) => {
    try {
        let { quantity } = req.params
        quantity = parseInt(quantity)

        if (!isNumber(quantity) || quantity <= 0) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        const expensesFind = await Expense.find()
            .limit(quantity)
            .sort({ createdAt: -1 })
            .populate('category', 'name')
            .populate('account', 'name')
            .lean()

        const expenses = expensesFind.map((exp) => ({
            ...exp,
            createdAt: dayjs(exp.createdAt).format("DD/MM/YYYY"),
            updatedAt: dayjs(exp.updatedAt).format("DD/MM/YYYY")
        }))

        return res.status(200).send({ expenses })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error retrieving expenses' })
    }
}

export const getMonthlyExpeses = async (req, res) => {
    try {
        const user = req.user

        const startOfMonth = dayjs().startOf("month").toDate()
        const endOfMonth = dayjs().endOf("month").toDate()

        const expenses = await Expense.find({
            user: user.id,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        })

        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)

        return res.status(200).send({ totalExpenses })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Server error" });
    }
}