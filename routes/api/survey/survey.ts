import express, { Request, Response } from 'express';
import passport from 'passport';
import db from '../../../models';
import authCheck from '../auth/authChecker';
const router = express.Router();

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
router.post('/', authCheck, async function (req: Request, res: Response) {
    const name: string = req.body.name;

    if (!req.user || req.user.level < 30)
        return res.status(404).send('권한이 부족합니다.');

    if (!name)
        return res.status(400).send('name을 입력해 주세요.');

    try {
        const surveyCheck = await db.Survey.findOne({
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
router.get('/', async function (req: Request, res: Response) {
    const { isDeleted } = req.query;

    try {
        if (!isDeleted) {
            const surveys = await db.Survey.find({
                isDeleted: false
            });

            res.json(surveys);
        } else {
            const surveys = await db.Survey.find({
                isDeleted: true
            });

            res.json(surveys);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/:surveyId', async function (req: Request, res: Response) {
    const surveyId: string = req.params.surveyId;

    try {
        const survey = await db.Survey.findOne({
            id: surveyId,
            isDeleted: false
        });

        if (!survey)
            return res.status(403).send('존재하지 않는 설문지입니다.');

        res.json(survey);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/:surveyId/problem', async function (req: Request, res: Response) {
    const { surveyId } = req.params;
    const { isDeleted } = req.query;

    try {
        const survey: any = await db.Survey.findOne({
            id: surveyId
        });

        if (!survey || survey.isDeleted)
            return res.status(404).send('문제집이 존재하지 않습니다.');

        if (!isDeleted) {
            const problems = await db.Problem.find({
                surveyId,
                isDeleted: false
            });
    
            res.json(problems);
        } else {
            const problems = await db.Problem.find({
                surveyId,
                isDeleted: true
            });
    
            res.json(problems);
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

router.put('/:surveyId', async function (req: Request, res: Response) {
    const surveyId: string = req.params.surveyId;
    const name: string = req.body.name;

    if (!name)
        return res.status(400).send('name을 입력해 주세요.');

    try {
        const survey = await db.Survey.findOne({
            id: surveyId
        });

        if (!survey)
            return res.status(404).send('존재하지 않는 설문지입니다.');

        const sameName = await db.Survey.findOne({
            name,
            isDeleted: false
        });

        if (sameName)
            return res.status(403).send('이미 존재하는 문제집 이름입니다.');

        await db.Survey.updateOne({
            id: surveyId
        }, {
            name: name
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/:surveyId', async function (req: Request, res: Response) {
    const surveyId: string = req.params.surveyId;

    try {
        const survey = await db.Survey.findOne({
            id: surveyId,
            isDeleted: false
        });

        if (!survey)
            return res.status(404).send('설문지가 존재하지 않습니다.');

        await db.Survey.updateOne({
            id: surveyId,
            isDeleted: false
        }, {
            isDeleted: true
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/:surveyId/recover', async function (req: Request, res: Response) {
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

router.post('/:surveyId/problem', async function (req: Request, res: Response) {
    const surveyId: string = req.params.surveyId;
    const content: string = req.body.content;
    const problemId: string = req.body.problemId;

    if (!content)
        return res.status(400).send('content를 입력해 주세요.');
    if (!problemId)
        return res.status(400).send('problemId를 입력해 주세요.');

    try {
        const Problem = await db.Problem.findOne({
            problemId,
            surveyId,
            isDeleted: false
        });

        if (Problem)
            return res.status(403).send('이미 존재하는 문항입니다.');

        await new db.Problem({
            problemId,
            surveyId,
            content
        }).save();

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default router;