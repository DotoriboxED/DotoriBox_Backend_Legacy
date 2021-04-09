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
        type: {
            type: Number,
            required: true
        },
        isSoldOut: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });

    productSchema.plugin(autoIncrement.plugin, {
        model: 'Product',
        field: 'id',
        startAt: 1,
        increment: 1
    });

    const Product = mongoose.model('Product', productSchema);

    return {
        Product
    }
}