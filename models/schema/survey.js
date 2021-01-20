module.exports = (mongoose, autoIncrement) => {
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
                type: mongoose.ObjectId,
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
                        type: String, 
                        required: true 
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
        problemId: mongoose.ObjectId,
        content: mongoose.Mixed
    });

    const Survey = mongoose.model('Survey', survey);
    const Problem = mongoose.model('Problem', problem);
    const Answer = mongoose.model('Answer', answer);

    return {
        Survey,
        Problem,
        Answer
    }
} 