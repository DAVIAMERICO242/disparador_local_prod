
import jwt,{JwtPayload} from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import {JwtSchema,RequestSchema} from  '../../sistema/schemas'
const secretKey = 'yJNIDJ8329D0'; // Change this to a secure random key


export const AuthBackendMiddleware = (req:RequestSchema,res:Response,next:NextFunction)=>{
    const token = req?.headers['token'] as string;
    if(!token){
      console.log('TOKEN NAO ENCONTRADO');
      return res.status(400).end();
    }
    try{
        const decoded = jwt.verify(token, secretKey) as JwtSchema;
        const user_name = decoded.username;
        req.user_name = user_name;
        req.token = token;
        next();
    }catch{
        console.log('NAO AUTORIZADO APESAR DE POSSUIR TOKEN')
        return res.status(400).end();
    }
}
