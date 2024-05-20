import dotenv from 'dotenv'; 
dotenv.config();
import express, {Request,Response} from 'express';
export const campaign_router = express.Router();
import {Campaigns,DeleteCampaigns, AllCampaignColumns} from './manage_database_campaigns';
import {RequestSchema} from '../../sistema/schemas'

campaign_router.get('/whole_campaigns', async (req:RequestSchema ,res: Response)=>{
  try{
    const user_name = req.user_name;
    const campaigns = req.query.campaigns;
    console.log('CHEGOU NO BACKEND ASSIM:')
    console.log(campaigns)
    if(!campaigns){
      res.status(400).end();
    }
    const campaigns_data = await AllCampaignColumns(user_name as string, campaigns as string[]);
    res.status(200).send(campaigns_data);
  }catch{
    res.status(500).end();
  }
})

campaign_router.post('/delete_campaigns', async (req:RequestSchema,res:Response)=>{
  try{
    const user_name = req.user_name;
    const campaigns = req.body.campaigns;
    if(!campaigns){
      res.status(400).end();
    }
    await DeleteCampaigns(user_name as string, campaigns);
    res.status(200).end();
  }catch{
    res.status(500).end();
  }
});


campaign_router.get('/campaigns', async (req:RequestSchema,res:Response)=>{
    try{
      const user_name = req.user_name;
      const token = req.token;
      const campaigns = await Campaigns(user_name as string);
      console.log('CAMPAIGN NAME')
      console.log(campaigns);
      res.status(200).send(campaigns);
    }catch{
      res.status(500).end()
    }
  });
  