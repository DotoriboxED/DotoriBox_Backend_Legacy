namespace Form {
    export interface Choice {
        content?: string
        choiceNum?: string
        'choice.$.content'?: string
        'choice.$.choiceNum'?: string
    }

    export interface Problem {
        problemId?: string,
        content?: string
    }
}

export default Form;