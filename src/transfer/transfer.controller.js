import Transfer from './transfer.model.js'
import Account from '../account/account.model.js'
import { validateFieldIsEmpty, isNumber } from '../utils/validator.js'
import dayjs from 'dayjs'

export const createTransfer = async (req, res) => {
    try {
        let data = req.body
        let user = req.user

        data.amount = Number(data.amount)
        if (data.amount !== undefined && !isNumber(data.amount)) {
            return res.status(400).send({ msg: 'The amount entered is incorrect.' })
        }

        if (data.amount <= 0) return res.status(400).send({ msg: 'The amount must be greater than zero.' })

        let { valid, field } = validateFieldIsEmpty(data, ['sourceAccount', 'destinationAccount', 'amount'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        let sourceAccount = await Account.findOne({ _id: data.sourceAccount, user: user.id }).populate('user', 'name openingBalance category')
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

        let transfer = new Transfer({ ...data, user: user.id })
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

export const editTransfer = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let user = req.user

        let transfer = await Transfer.findOne({ _id: id, user: user.id })
        if (!transfer) return res.status(404).send({ msg: 'Transfer not found' })

        let { valid, field } = validateFieldIsEmpty(data, ['description'])
        if (!valid) return res.status(400).send({ msg: `${field} is required` })

        const allowedFields = ['description'];
        let updateData = {};
        let invalidFields = [];

        Object.keys(data).forEach(field => {
            if (allowedFields.includes(field)) {
                updateData[field] = data[field]
            } else {
                invalidFields.push(field)
            }
        })

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({
                msg: 'No valid fields to update',
                invalidFields
            })
        }

        let transferUpdate = await Transfer.findOneAndUpdate(
            { _id: id, user: user.id },
            updateData,
            { new: true }
        )
        if (!transferUpdate) return res.status(409).send({ msg: 'The transfer could not be updated.' })

        return res.status(200).send({ msg: 'Transfer successfully updated', transferUpdate })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Error editing transfer details' })
    }
}

export const getTransfers = async (req, res) => {
    try {
        let user = req.user

        let transfers = await Transfer.find({ user: user.id })
            .populate('sourceAccount', 'name')
            .populate('destinationAccount', 'name')
            .lean()

        const formattedTransfers = transfers.map((trans) => ({
            ...trans,
            createdAt: dayjs(trans.createdAt).format('DD/MM/YYYY'),
            updatedAt: dayjs(trans.updatedAt).format('DD/MM/YYYY')
        }))

        return res.status(200).send({ formattedTransfers })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Server Error' })
    }
}