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

    export interface Response {
        sucess: boolean,
        message?: string,
        code?: number
    };

    export interface Sample {
        name?: string,
        stock?: number
    }
}

export default Form;