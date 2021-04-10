import { Router, Request, Response } from 'express'
import db from '../../../models/index'
import sendErrorResponse from '../tools/error';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { name, stock, price, type } = req.body;

    try {
        await db.Product.create({
            name,
            stock,
            price,
            type
        });

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const products = await db.Product.find({
            isDeleted: false
        });

        return res.json(products);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

router.put('/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { name, stock, price, type, isSoldOut, isDeleted } = req.body;
    const update: Record<string, unknown> = {}

    if (name) update.name = name;
    if (stock) update.stock = stock;
    if (price) update.price = price;
    if (type) update.type = type;
    if (isSoldOut !== undefined) update.isSoldOut = isSoldOut;
    if (isDeleted !== undefined) update.isDeleted = isDeleted;
    
    try {
        const result = await db.Product.updateOne({
            id: productId,
            isDeleted: false
        }, update)

        res.sendStatus(200);
    } catch (err) {
        sendErrorResponse(res, 500, 'unknown_error', err);
    }
});

export default router;