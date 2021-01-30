import express, { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../../../models';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const router = Router();
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'dotori'
}

passport.use(
    'local',
    new JwtStrategy(
        opts,
        async function (payload: any, done: Function) {
            try {
                const user = await db.User.findOne({
                    _id: payload._id
                });

                if (user) return done(null, user);
                return done(null, false);
            } catch (err) {
                done(err);
            }
        }
    )
);

router.post('/signup/local', async function (req: Request, res: Response) {
    const { username, password, email, isMan, Birthday } = req.body;

    try {
        const userCheck = await db.User.findOne({
            email
        });

        if (userCheck)
            return res.status(403).send('이미 존재하는 계정입니다.');

        const cryptPassword = bcrypt.hashSync(password, 7);

        await db.User.create({
            username,
            password: cryptPassword,
            email,
            isMan,
            Birthday
        });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/signup/kakao', async function (req: Request, res: Response) {
    res.redirect('https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=' + process.env.KAKAO_REST_KEY
                + '&redirect_uri=' + 'http://localhost:3000/api/auth/signup/kakao/callback');
});

router.get('/signup/kakao/callback', async function (req: Request, res: Response) {
    const { code } = req.query;

    try {
        const token = await axios.post('https://kauth.kakao.com/oauth/token', {}, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_REST_KEY,
                redirect_uri: 'http://localhost:3000/api/auth/signup/kakao/callback',
                code: code
            }
        });

        const data: any = await axios.post('https://kapi.kakao.com/v2/user/me', {}, {
            headers: {
                'Authorization': 'Bearer ' + token.data.access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { email } = data.data.kakao_account;
        console.log(data.data);

        let user: any = await db.User.findOne({
            email
        });

        if (!user) {
            let isMan;
            if (data.data.kakao_account.gender === 'male') isMan = true;
            else isMan = false;

            await db.User.create({
                email,
                isMan,
                profilePic: data.data.properties.profile_image,
                Birthday: '1998-12-04'
            });

            user = await db.User.findOne({
                email
            });
        }

        if (user.isBlocked)
            return res.status(403).send('접근이 제한된 계정입니다.');

        const payload = {
            _id: user?._id,
            level: user?.level
        }

        const userToken = await jwt.sign(payload, 'dotori', { expiresIn: 3600 });
        const response = {
            success: true,
            token: 'Bearer ' + userToken
        }
        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/signin/local', async function (req: Request, res: Response) {
    const { password, email } = req.body;

    try {
        const user: any = await db.User.findOne({
            email  
        });

        const comparePassword = bcrypt.compareSync(user.password, password);

        if (comparePassword)
            return res.status(403).send('비밀번호가 다릅니다.');
        if (user.isBlocked)
            return res.status(403).send('제한된 사용자입니다.');

        const payload = {
            _id: user._id,
            level: user.level
        };

        const token = await jwt.sign(payload, 'dotori', { expiresIn: 3600 });
        const response = {
            success: true,
            token: 'Bearer ' + token
        }
        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default router;