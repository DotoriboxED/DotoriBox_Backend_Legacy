import mongoose from 'mongoose';

export default function () {
    const user = new mongoose.Schema({
        username: {
            type: String
        },
        password: {
            type: String
        },
        level: {
            type: Number,
            default: 1,
            required: true,
            min: 1,
            max: 30
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
        Birthday: {
            type: Date,
            required: true
        },
        profilePic: {
            type: String
        },
        phoneNumber: {
            type: String
        }
    });

    const User = mongoose.model('User', user);

    return {
        User
    }
}