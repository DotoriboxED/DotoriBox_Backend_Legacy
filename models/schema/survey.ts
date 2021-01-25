import mongoose from 'mongoose';

export default function (autoIncrement: any) {
    const survey = new mongoose.Schema({
        id: {
            type: Number
        },
        name: {
            type: String,
            required: true,
            unique: true
        },                               
        isDeleted: {
            type: Boolean,
            required: true,
            default: false
        },
        problems: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Problem'
            }
        ]
    }, {
        timestamps: true
    });
    
    survey.plugin(autoIncrement.plugin, {
        model: 'survey',
        field: 'id',
        startAt: 1,
        increment: 1
    });
    
    const problem = new mongoose.Schema({
        id: {
            type: Number
        },
        problemId: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false
        },
        content: {
            type: String,
            required: true
        },
        choice: {
            type: [
                new mongoose.Schema({
                    choiceNum: { 
                        type: Number,
                        required: true 
                    },
                    isDeleted: {
                        type: Boolean,
                        required: true,
                        default: false
                    },
                    content: { 
                        type: String 
                    },
                    image: {
                        type: String
                    }
                })
            ]
        }
    });
    
    problem.plugin(autoIncrement.plugin, {
        model: 'problem',
        field: 'id',
        startAt: 1,
        increment: 1
    });
    
    const answer = new mongoose.Schema({
        problemId: mongoose.Schema.Types.ObjectId,
        content: mongoose.Schema.Types.Mixed
    });
    
    const Survey = mongoose.model('Survey', survey);
    const Problem = mongoose.model('Problem', problem);
    const Answer = mongoose.model('Answer', answer);

    return { Survey, Problem, Answer }
}