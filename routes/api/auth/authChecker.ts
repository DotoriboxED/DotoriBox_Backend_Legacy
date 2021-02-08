import { Request, Response } from 'express';
import passport from 'passport'

export default function (req: Request, res: Response, next: Function) {
    return passport.authenticate('local', {
        session: false
    }, (err, user, info) => {
        if (err) {
            console.log(err);
            next(err);
        }
        if (!user) {
            req.user = undefined;
            return next();
        }
        req.user = user;
        next();
    }) (req, res, next);
}