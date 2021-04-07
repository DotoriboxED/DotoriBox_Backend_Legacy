import mongoose from 'mongoose'

export default (autoIncrement: any) => {
    const productSchema = new mongoose.Schema({
        id: {
            type: Number
        },
        name: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    })
}