import { Schema, model } from "mongoose";

const accountSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['Ahorro', 'Monetaria', 'Billetera', 'Otros'],
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    versionKey: false
})

export default model('account', accountSchema)