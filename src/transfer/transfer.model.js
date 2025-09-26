import { Schema, model } from "mongoose";

const transferSchema = new Schema({
    sourceAccount: {
        type: Schema.ObjectId,
        required: true,
        ref: 'account'
    },
    destinationAccount: {
        type: Schema.ObjectId,
        required: true,
        ref: 'account'
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    user: {
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model('transfer', transferSchema)