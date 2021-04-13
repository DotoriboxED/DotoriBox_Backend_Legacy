import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import uuid from 'uuid';
import sendErrorResponse from '../tools/error';
import Form from '../tools/formObj';
import db from '../../../models/index';
import authChecker from '../auth/authChecker';
import { PathLike, promises } from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, 'uploads/sample/')
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

router.post('/',
    authChecker,
    function (req: Request, file: object, next: Function) {
        req.newFileName = uuid.v4();
        next();
    },
    upload.single('attachment'),
    async (req: Request, res: Response) => {
        const { name, link, content } = req.body;

        if (!req.file)
            return sendErrorResponse(res, 400, 'image_not_exists');

        const image = req.newFileName + path.extname(req.file.originalname);

        if (!req.user || !req.user.isAdmin) {
            promises.unlink(image);
            return sendErrorResponse(res, 403, 'not_admin');
        }

        if (!name || !link || !content || !req.file)
            return sendErrorResponse(res, 400, 'no_input');

        try {
            const duplicate = await db.Sample.findOne({
                name,
                isDeleted: false
            });

            if (duplicate)
                return sendErrorResponse(res, 403, 'name_already_exists');

            await db.Sample.create({
                name,
                image,
                link,
                content
            });

            return res.sendStatus(201);
        } catch (err) {
            sendErrorResponse(res, 500, 'unknown_error', err);
        }
    });

router.get('/', authChecker, async (req: Request, res: Response) => {
    const { isDeleted } = req.query;

    try {
        if (isDeleted) {
            if (req.user === undefined || !req.user.isAdmin)
                return sendErrorResponse(res, 403, 'less_level');

            const products = await db.Sample.find({
                isDeleted: true
            });

            res.json(products);
        } else {
            const products = await db.Sample.find({
                isDeleted: false
            });

            res.json(products);
        }
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.get('/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const product = await db.Sample.findOne({
            id: productId,
            isDeleted: false
        });

        if (!product)
            return sendErrorResponse(res, 404, 'product_not_exists');

        res.json(product);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.get('/:productId/image', async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const product: any = await db.Sample.findOne({
            id: productId,
            isDeleted: false
        });

        if (!product)
            return sendErrorResponse(res, 404, 'product_not_exists');

        res.download('./uploads/sample/' + product.image);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.put('/:productId',
    authChecker,
    function (req: Request, file: object, next: Function) {
        req.newFileName = uuid.v4();
        next();
    },
    upload.single('attachment'),
    async (req: Request, res: Response) => {
        const { productId } = req.params;
        const { name, stock, link, content } = req.body;
        const product: Record<string, unknown> = {};

        let image;

        if (req.file)
            image = req.newFileName + path.extname(req.file.originalname);

        if (!req.user || !req.user.isAdmin) {
            if (image)
                promises.unlink(image as PathLike);
            return sendErrorResponse(res, 403, 'not_admin');
        }

        if (name) product.name = name;
        if (stock) product.stock = stock;
        if (image) product.image = image;
        if (link) product.link = link;
        if (content) product.content = content; 

        try {
            await db.Sample.updateOne({
                id: productId,
                isDeleted: false
            }, product);

            res.sendStatus(200);
        } catch (err) {
            sendErrorResponse(res, 500, 'unknown_error', err);
        }
    });

router.put('/:productId/recover', async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const product = await db.Sample.findOne({
            id: productId,
            isDeleted: false
        });

        if (!product)
            return sendErrorResponse(res, 404, 'product_not_exists');

        await db.Sample.updateOne({
            id: productId
        }, {
            isDeleted: false
        });

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.delete('/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const check = await db.Sample.find({
            id: productId,
            isDeleted: false
        });

        if (!check)
            return sendErrorResponse(res, 404, 'product_not_exists');

        await db.Sample.updateOne({
            id: productId,
            isDeleted: false
        }, {
            isDeleted: true
        });

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

export default router;