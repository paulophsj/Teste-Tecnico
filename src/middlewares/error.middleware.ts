import e, { NextFunction, Request, Response } from "express";
import { HttpError } from "../util/error.util";

function errorMiddleware(error: HttpError, req: Request, res: Response, next: NextFunction) {
    if(error instanceof HttpError){
        return res.status(error.status).json({message: error.message})
    }
    return res.status(500).json({message: "Erro interno do servidor."})
}

export default errorMiddleware