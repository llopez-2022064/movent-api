import { Schema, model } from "mongoose";

const transferSchema = new Schema({
    sourceAccount: {
        type: Schema.ObjectId,
        required: true
    },
    destinationAccount: {
        type: Schema.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model('transfer', transferSchema)