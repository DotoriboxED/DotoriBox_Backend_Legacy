import express, { Request, Response } from 'express';
import db from '../../../models';
import tool from '../tool';
import form from '../formObj'

const router = express.Router();

router.delete('/:problemId', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;
    const content: string = req.body.content;

    if (!content)
        return res.status(400).send('content를 입력해 주세요.')

    try {
        const problem = await db.Problem.findOne({
            problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('문제가 존재하지 않습니다.');

        await db.Problem.updateOne({
            problemId,
            isDeleted: false
        }, {
            isDeleted: true
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/:problemId/answer', async function (req: Request, res: Response) {
    const content: string = req.body.content;
    const problemId: string = req.params.problemId;

    const type: string = tool.getType(content);
    if (type != 'Number' && type != 'String' && type != 'Boolean')
        return res.status(403).send('잘못된 입력입니다.');

    try {
        const problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('존재하지 않는 문제입니다.');

        await new db.Answer({
            problemId: problem._id,
            content
        }).save();

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/:problemId/answer', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;

    try {
        const problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('존재하지 않는 문제입니다.');

        const answer = await db.Answer.find({
            problemId: problem._id
        });

        res.json(answer);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/:problemId/choice', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;
    const choiceNum: string = req.body.choiceNum;
    const content: string = req.body.content;
    const choice: form.Choice = {};

    if (!choiceNum) return res.status(400).send('choiceNum을 입력해 주세요.');
    if (!content) return res.status(400).send('content를 입력해 주세요.');

    try {
        const problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('존재하지 않는 문제입니다.');

        const choiceCheck = await db.Problem.findOne({
            id: problemId,
            isDeleted: false,
            'choice.isDeleted': false,
            'choice.choiceNum': choiceNum
        });

        if (choiceCheck)
            return res.status(403).send('이미 있는 choiceNum입니다.');

        choice.content = content;
        choice.choiceNum = choiceNum;

        await db.Problem.updateOne({
            id: problemId,
            isDeleted: false
        }, {
            $push: {
                choice
            }
        });

        return res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/:problemId/choice/:choiceNum', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;
    const choiceNum: string = req.params.choiceNum;
    const updateNum: string = req.body.choiceNum;
    const content: string = req.body.content;

    const update: form.Choice = {};

    if (content) update['choice.$.content'] = content;
    if (updateNum) update['choice.$.choiceNum'] = updateNum;
    if (!content && !choiceNum) return res.status(400).send('content 혹은 choiceNum을 입력해 주십시오.');
    
    try {
        const problem = await db.Problem.findOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDelete': false
        });

        if (!problem)
            return res.status(404).send('문제 혹은 문항이 존재하지 않습니다.');

        const dup = await db.Problem.findOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': updateNum,
            'choice.isDeleted': false
        });

        if (dup)
            return res.status(403).send('이미 동일한 번호의 문항이 존재합니다.');

        await db.Problem.updateOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDelete': false
        }, update);

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/:problemId/choice/:choiceNum', async function (req: Request, res: Response) {
    const problemId: string = req.params.problemId;
    const choiceNum: string = req.params.choiceNum;

    try {
        const choice = await db.Problem.findOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDeleted': false
        });

        if (!choice)
            return res.status(404).send('문제 혹은 문항이 존재하지 않습니다.');

        await db.Problem.updateOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum,
            'choice.isDeleted': false
        }, {
            'choice.$.isDeleted': true
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default router;