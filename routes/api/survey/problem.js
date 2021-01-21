const express = require('express');
const router = express.Router();
const db = require('../../../models');
const tool = require('../tool');

router.post('/:problemId/answer', async function (req, res) {
    const content = req.body.content;
    const problemId = req.params.problemId;

    const type = tool.getType(content);
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

router.get('/:problemId/answer', async function (req, res) {
    const problemId = req.params.problemId;

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

router.post('/:problemId/choice', async function (req, res) {
    const problemId = req.params.problemId;
    const choiceNum = req.body.choiceNum;
    const content = req.body.content;
    let choice = {};

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

router.put('/:problemId/choice/:choiceNum', async function (req, res) {
    const problemId = req.params.problemId;
    const choiceNum = req.params.choiceNum;
    const content = req.body.content;

    if (!content)
        return res.status(400).send('content를 입력해 주세요.');
    
    try {
        const problem = await db.Problem.findOne({
            problemId,
            'choice.choiceNum': choiceNum,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('문제 혹은 문항이 존재하지 않습니다.');

        await db.Problem.updateOne({
            problemId,
            isDeleted: false,
            'choice.choiceNum': choiceNum
        }, {
            'choice.$.content': content
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;