import express from 'express';

namespace Form {
    export interface Choice {
        content?: string
        choiceNum?: string
        'choice.$.content'?: string
        'choice.$.choiceNum'?: string
    }
}

export default Form;