import mongoose from 'mongoose';

export default function () {
    const user = new mongoose.Schema({
        name: {
            type: String
        },
        isBlocked: {
            type: Boolean,
            required: true,
            default: false
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        isMan: {
            type: Boolean,
            required: true
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        Birthday: {
            type: Date,
            required: true
        },
        phoneNum: {
            type: String
        },
        userType: {
            type: String,
            required: true
        }
    });

    const User = mongoose.model('User', user);

    return {
        User
    }
}