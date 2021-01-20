const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const db = require('../../models');

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, req.newFileName + path.extname(file.originalname));
    }
});

function fileFilter(res, file, cb) {
    const extension = file.mimetype.split('/')[0];

    if (extension === 'image') //Check && Upload...
        return cb(null, true);

    return cb(new Error('업로드를 지원하지 않는 형식의 파일입니다.'), false);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post('/problem/:problemId/choice/:choiceNum', 
    function (req, file, next) {
        req.newFileName = Date.now();
        next();
    },
    upload.single('attachment'),
    async function (req, res) {
        let problemId = req.params.problemId;
        let choiceNum = req.params.choiceNum;
        let file = req.file;

        let ext = file.originalname.split('.');
        let filename = req.newFileName + '.' + ext[ext.length - 1];

        try {
            let picture = await db.Problem.findOne({
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
    let problemId = req.params.problemId;
    let choiceNum = req.params.choiceNum;

    try {
        let problem = await db.Problem.findOne({
            'id': problemId,
            'choice.choiceNum': choiceNum
        });

        console.log(problem);

        if (!problem) return res.status(404).send('존재하지 않는 문제입니다.');
        if (!problem.choice) return res.status(404).send('선택지가 존재하지 않습니다.');
        if (!problem.choice[0].image) return res.status(404).send('이미지가 존재하지 않습니다.');

        res.download('./uploads/' + problem.choice[0].image, problem.choice[0].image);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;