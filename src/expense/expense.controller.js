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
