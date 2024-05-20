import dotenv from 'dotenv'; 
dotenv.config();
import express, {Request, Response} from 'express';
export const woocommerce_router = express.Router();
import {getWoocAllCustomersData} from './woocommerce';
import { RequestSchema } from '../schemas';


woocommerce_router.get('/woocommerce_orders', async (req:RequestSchema,res:Response)=>{
    try{
      const token = req.token;
      const user_name = req.user_name;
      console.log('SITE')
      console.log(req.query)
      const site = 'https://' + ((req.query?.site) as string | undefined)?.replace(' ','');
      console.log('debug')
      const consumerKey = ((req.headers['consumerkey']) as string | undefined)?.replace(' ','');
      const consumerSecret = ((req.headers['consumersecret']) as string | undefined)?.replace(' ','');
      const {start_date} = req.query;
      const {end_date} = req.query;
      const {order_status} = req.query;
      console.log('HEADERS');
      console.log(req.headers);
      console.log([site,consumerKey,consumerSecret,start_date,end_date,order_status]);

      var orders = await getWoocAllCustomersData(site,
        consumerKey as string,
        consumerSecret as string,
        start_date as string,
        end_date as string,
        order_status as string);

      if(!orders){
        res.status(404).end();
      }else{
        res.status(200).send(orders);
      }  
    }catch(error){
      console.log(error)
      res.status(500).end()
    }
  
  })
