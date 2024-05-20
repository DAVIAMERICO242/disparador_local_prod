import jwt,{JwtPayload} from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express'
import http from 'http';
import WebSocket from 'ws';


export interface JwtSchema extends JwtPayload{
    username: string
}

export interface RequestSchema extends Request{
    user_name?:string;
    token?:string,
}

export interface WebSocketSchema extends WebSocket{
    user:string
}

export interface loginSchema{
    user:string,
    pass:string
}


export interface WebSocketIncomingMessageSchema extends http.IncomingMessage {
    user?: string;
}

export interface evolutionSchema{
    number:string,
    mediaMessage?:{
      mediatype:string,
      caption:string,
      media:string
    },
    textMessage?:{
      text:string
    }
}

export interface contactSchema{//schema de contatos para filtragem e disparo
    nome?:string,
    phone?:string
}

export interface DBRowSchema{
    target_number: string;
    moment: any;
    truthy_connection: string;
    campaign: string;
    contact_name: string; 
}


export interface campaignSchema{//esquema apaenas pra exportação
    Data:string,
    Campanha:string,
    Conexão:string,
    'Nome contato':string,
    'Número disparado':string
}

export interface WoocSchema{
    order_number?:string | number,
    order_date?:string,
    order_status?:string,
    nome?:string,
    phone?:string

}

  