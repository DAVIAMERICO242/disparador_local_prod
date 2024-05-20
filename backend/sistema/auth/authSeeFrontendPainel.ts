import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 
dotenv.config();
export const is_user_auth_to_see_painel_router = express.Router()
const secretKey = 'yJNIDJ8329D0'; // Change this to a secure random key
import { RequestSchema } from '../schemas';


//isso e para proteger rota no frontend
is_user_auth_to_see_painel_router.get('/private_route', (req:RequestSchema,res)=>{
    console.log('erro ?')
    const token = req?.headers['token'] as string;
    if(!token){
        res.status(404).send('NAO AUTORIZADO')
        return
    }else{
        jwt.verify(token, secretKey, (err, user) => {
            if (err) return res.status(403).end();
            console.log('rota privada autorizada')
            res.status(200).end()
        });
    }
})

