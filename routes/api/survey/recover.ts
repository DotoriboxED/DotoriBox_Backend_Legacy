import express, { Request, Response } from 'express';
import db from '../../../models';
const router = express.Router();

router.post('/survey/:surveyId', async function (req: Request, res: Response) {
    const surveyId: string = req.params.surveyId;

    try {
        const survey = await db.Survey.findOne({
            id: surveyId,
            isDeleted: true
        });

        if (!survey)
            return res.status(404).send('삭제된 해당 문제집이 존재하지 않거나 문제집이 존재하지 않습니다.');
        
        await db.Survey.updateOne({
            id: surveyId,
            isDeleted: true
        }, {
            isDeleted: false
        });

        return res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/problem/:problemId', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;

    try {
        const problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('삭제된 해당 문제가 존재하지 않거나 문제가 존재하지 않습니다.');

        await db.Problem.updateOne({
            id: problemId,
            isDeleted: true
        }, {
            isDeleted: false
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/problem/:problemId/choice/:choiceNum', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;
    const choiceNum: string = req.params.choiceNum;

    try {
        const choice = await db.Problem.findOne({
            id: problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDeleted': true
        });

        if (!choice)
            return res.status(404).send('삭제된 문항이 존재하지 않거나 문제 혹은 문항이 존재하지 않습니다.');

        await db.Problem.updateOne({
            id: problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDeleted': true
        }, {
            'choice.$.isDeletd': false
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default router;