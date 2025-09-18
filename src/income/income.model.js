import { Schema, model } from "mongoose";

const incomeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    account: {
        type: Schema.ObjectId,
        ref: 'account',
        required: true
    },
    amount: {
        type: Number,
        required: true
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

export default model('income', incomeSchema)