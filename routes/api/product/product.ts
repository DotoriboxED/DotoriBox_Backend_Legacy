import { Router, Request, Response } from 'express';
import sendErrorResponse from '../error';
import Form from '../formObj';
import db from '../../../models/index';
import authChecker from '../auth/authChecker';
const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { productName } = req.body;

    try {
        const duplicate = await db.Product.findOne({
            name: productName,
            isDeleted: false
        });

        if (duplicate)
            return sendErrorResponse(res, 403, 'name_already_exists');

        await db.Product.create({
            name: productName,
            stock: 0
        });

        return res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.get('/', authChecker,  async (req: Request, res: Response) => {
    const { isDeleted } = req.query;

    try {
        if (isDeleted) {
            if (req.user === undefined || req.user.level < 30)
                return sendErrorResponse(res, 403, 'less_level');

            const products = await db.Product.find({
                isDeleted: true
            });

            res.json(products);
        } else {
            const products = await db.Product.find({
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
        const product = await db.Product.findOne({
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

router.put('/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { productName, stock } = req.body;
    const product: Form.Product = {};

    if (productName) product.name = productName;
    if (stock) product.stock = stock;

    if (!productName && !stock)
        sendErrorResponse(res, 400, 'no_input');

    try {
        await db.Product.updateOne({
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
        const product = await db.Product.findOne({
            id: productId,
            isDeleted: false
        });

        if (!product)
            return sendErrorResponse(res, 404, 'product_not_exists');

        await db.Product.updateOne({
            id: productId
        }, {
            isDeleted: false
        });

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.put('/:productId/use', async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
        const product: any = await db.Product.findOne({
            id: productId,
            isDeleted: false
        });

        if (product.stock === 0)
            return sendErrorResponse(res, 400, 'no_stock');
        
        await db.Product.updateOne({
            id: productId,
            isDeleted: false
        }, {
            $inc: {
                stock: -1
            }
        });

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.delete('/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;
    
    try {
        const check = await db.Product.find({
            id: productId,
            isDeleted: false
        });

        if (!check)
            return sendErrorResponse(res, 404, 'product_not_exists');

        await db.Product.updateOne({
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