const express = require('express');
const app = require('../../app');
const router = express.Router();
const db = require('../../models');
const tool = require('./tool');

/**
 * @swagger
 * tags:
 *  name: Survey
 */

 /**
  * @swagger
  * /api/survey/:
  *     post:
  *         tags: [Survey]
  *         summary: 설문지 생성
  *         parameters:
  *             - in: body
  *               name: name
  *               schema:
  *                   type: object
  *                   properties:
  *                       name:
  *                           type: string
  *         responses:
  *             400:
  *                 description: 설문지의 이름(name)이 입력이 안 된 경우  
  *                 schema:
  *                     type: object
  *                     properties:
  *                         error:
  *                             type: object
  *                             properties:
  *                                 code:
  *                                     type: number
  *                                     example: 400
  *                                 name:
  *                                     type: string
  *                                     example: name을 입력해 주세요.
  *             403:
  *                 description: 이미 같은 이름의 설문지(제품)가 있는 경우
  *                 schema:
  *                     type: object
  *                     properties:
  *                         error:
  *                             type: object
  *                             properties:
  *                                 code:
  *                                     type: number
  *                                     example: 403
  *                                 name:
  *                                     type: string
  *                                     example: 이미 설문지가 존재합니다.
  *             200:
  *                 description: 생성 성공
  */
router.post('/', async function (req, res) {
    let name = req.body.name;

    if (!name)
        return res.status(400).send('name을 입력해 주세요.');

    try {
        let surveyCheck = await db.Survey.findOne({
            name: name,
            isDeleted: false
        });

        if (surveyCheck)
            return res.status(403).send('이미 설문지가 존재합니다.');

        await new db.Survey({
            name: name
        }).save();

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

/**
  * @swagger
  * /api/survey/:
  *     get:
  *         tags: [Survey]
  *         summary: 설문지 생성
  *         responses:
  *             200:
  *                 description: 조회 성공
  *                 schema:
  *                     ArrayOfUsers:
  *                         type: array
  *                         items:
  *                             type: object
  *                             properties:
  *                                 id:
  *                                     type: number
  *                                 name:
  *                                     type: string
  *                                 isDeleted:
  *                                     type: boolean
  *                                 problems:
  *                                     type: array
  *                                     items:
  *                                         type: string
  *                                 createdAt:
  *                                     type: string
  *                                     format: date-time
  *                                 updatedAt:
  *                                     type: string
  *                                     format: date-time
  */
router.get('/', async function (req, res) {
    try {
        let surveys = await db.Survey.find({
            isDeleted: false
        });

        res.json(surveys);
    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/:surveyId', async function (req, res) {
    let surveyId = req.params.surveyId;

    try {
        let survey = await db.Survey.findOne({
            id: surveyId,
            isDeleted: false
        }).populate({
            path: 'problems',
            match: {
                isDeleted: false,
                'choice.$.isDeleted': false
            }
        });

        if (!survey)
            return res.status(403).send('존재하지 않는 설문지입니다.');

        res.json(survey);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.update('/:surveyId', async function (req, res) {
    let surveyId = req.params.surveyId;

    try {
        
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/:surveyId/problem', async function (req, res) {
    let surveyId = req.params.surveyId;
    let content = req.body.content;
    let problemId = req.body.problemId;

    if (!content)
        return res.status(400).send('content를 입력해 주세요.');
    if (!problemId)
        return res.status(400).send('problemId를 입력해 주세요.');

    try {
        let checkProblem = await db.Problem.findOne({
            problemId,
            isDeleted: false
        });

        if (checkProblem)
            return res.status(403).send('problemId가 중복입니다.');

        let problem = await new db.Problem({
            problemId,
            content
        }).save();

        await db.Survey.updateOne({
            id: surveyId
        }, {
            $push: {
                problems: problem._id
            }
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/problem/:problemId/answer', async function (req, res) {
    let content = req.body.content;
    let problemId = req.params.problemId;

    let type = tool.getType(content);
    if (type != 'Number' && type != 'String' && type != 'Boolean')
        return res.status(403).send('잘못된 입력입니다.');

    try {
        let problem = await db.Problem.findOne({
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



router.get('/problem/:problemId/answer', async function (req, res) {
    let problemId = req.params.problemId;

    try {
        let problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('존재하지 않는 문제입니다.');

        let answer = await db.Answer.find({
            problemId: problem._id
        });

        res.json(answer);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/problem/:problemId/choice', async function (req, res) {
    let problemId = req.params.problemId;
    let choiceNum = req.body.choiceNum;
    let content = req.body.content;
    let choice = {};

    if (!choiceNum) return res.status(400).send('choiceNum을 입력해 주세요.');
    if (!content) return res.status(400).send('content를 입력해 주세요.');

    try {
        let problem = await db.Problem.findOne({
            id: problemId,
            isDeleted: false
        });

        if (!problem)
            return res.status(404).send('존재하지 않는 문제입니다.');

        let choiceCheck = await db.Problem.findOne({
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
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;