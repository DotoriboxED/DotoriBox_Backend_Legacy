import mongoose from 'mongoose';

export default (autoIncrement: any) => {
    const sampleSchema = new mongoose.Schema({
        id: {
            type: Number,
        },
        name: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
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

    sampleSchema.plugin(autoIncrement.plugin, {
        model: 'Sample',
        field: 'id',
        startAt: 1,
        increment: 1
    });

    const Sample = mongoose.model('Sample', sampleSchema);

    return {
        Sample
    }
}