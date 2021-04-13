import mongoose from 'mongoose';

export default (autoIncrement: any) => {
    const itemSchema = new mongoose.Schema({
        id: {
            type: Number,
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        link: {
            type: String,
            required: true
        },
        content: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    });

    itemSchema.plugin(autoIncrement.plugin, {
        model: 'Item',
        field: 'id',
        startAt: 1,
        increment: 1
    });

    const Item = mongoose.model('Item', itemSchema);

    return {
        Item
    }
}