import { model, Schema } from "mongoose";

const expenseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: Schema.ObjectId,
        ref: 'category',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    account: {
        type: Schema.ObjectId,
        ref: 'account',
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

export default model('expense', expenseSchema)