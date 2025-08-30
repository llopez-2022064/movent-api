import Transfer from './transfer.model.js'
import Account from '../account/account.model.js'
import { validateFieldIsEmpty, isNumber } from '../utils/validator.js'

export const createTransfer = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero.' })

        let { valid, field } = validateFieldIsEmpty(data, ['sourceAccount', 'destinationAccount', 'amount'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        let sourceAccount = await Account.findOne({ _id: data.sourceAccount }).populate('user', 'name openingBalance category')
        if (!sourceAccount) return res.status(404).send({ msg: 'The source account does not exist' })

        let destinationAccount = await Account.findOne({ _id: data.destinationAccount, user: user.id })
        if (!destinationAccount) return res.status(404).send({ msg: 'The destination account was not found.' })

        if (sourceAccount.openingBalance < data.amount) return res.status(409).send({ msg: 'Insufficient balance' })

        //Descontar la cantidad de la cuenta de origen
        sourceAccount.openingBalance -= data.amount
        await sourceAccount.save()

        //Agregar la cantidad a la cuenta de destino
        destinationAccount.openingBalance += data.amount
        await destinationAccount.save()

        let transfer = new Transfer(data)
        await transfer.save()

        return res.status(200).send({
            msg: 'Successful transfer',
            accounts: {
                previous: sourceAccount,
                current: destinationAccount
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error creating a transfer' })
    }
}