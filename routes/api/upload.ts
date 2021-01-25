import express, { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import db from '../../models';
import uuid from 'uuid';

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, 'uploads/')
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, req.newFileName + path.extname(file.originalname));
    }
});

function fileFilter(res: Request, file: Express.Multer.File, cb: Function) {
    const extension: string = file.mimetype.split('/')[0];

    if (extension === 'image') //Check && Upload...
        return cb(null, true);

    return cb(new Error('업로드를 지원하지 않는 형식의 파일입니다.'), false);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post('/problem/:problemId/choice/:choiceNum', 
    function (req: Request, file: object, next: Function) {
        req.newFileName = uuid.v4();
        next();
    },
    upload.single('attachment'),
    async function (req: Request, res: Response) {
        const problemId: string = req.params.problemId;
        const choiceNum: string = req.params.choiceNum;
        const file = req.file;

        const ext = file.originalname.split('.');
        const filename = req.newFileName + '.' + ext[ext.length - 1];

        try {
            const picture = await db.Problem.findOne({
                'id': problemId,
                'isDeleted': false,
                'choice.choiceNum': choiceNum,
                'choice.isDeleted': false
            });

            if (!picture)
                return res.status(404).send('해당하는 질문 혹은 문항이 존재하지 않습니다.');

            await db.Problem.updateOne({
                'id': problemId,
                'choice.choiceNum': choiceNum,
                'choice.isDeleted': false
            }, {
                $set: {
                    'choice.$.image': filename
                }
            });

            res.sendStatus(200);
        } catch (err) {
            res.status(500).send(err);
        }
    }
);

router.get('/problem/:problemId/choice/:choiceNum', async function (req, res) {
    const problemId = req.params.problemId;
    const choiceNum = req.params.choiceNum;

    try {
        const problem: any = await db.Problem.findOne({
            'id': problemId,
            'choice.choiceNum': choiceNum
        });

        if (!problem) return res.status(404).send('존재하지 않는 문제입니다.');
        if (!problem.choice) return res.status(404).send('선택지가 존재하지 않습니다.');
        if (!problem.choice[0].image) return res.status(404).send('이미지가 존재하지 않습니다.');

        res.download('./uploads/' + problem.choice[0].image, problem.choice[0].image);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

export default router;