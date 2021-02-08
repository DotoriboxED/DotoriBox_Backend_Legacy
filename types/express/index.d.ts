declare namespace Express {
    interface Request {
        newFileName?: string,
        user?: {
            level: number
        }
    }
}