import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch'
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`);
import { contactSchema } from '../../schemas';


export const getWhatsappContactsByAPI = async(connection_name:string, user_name:string):Promise<contactSchema[]>=>{
    const server_connection_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
  
    const headers0 = {
      'accept': 'application/json',
      'apikey': `${process.env.WPPAPI_KEY}`,
      'Content-Type': 'application/json'
    };
  
    try{
      const contacts = await fetch(`${WPPAPI_URL}/chat/findContacts/${server_connection_name}`, {
        method: 'POST',
        headers: headers0
      });
      const contacts_phones:contactSchema[] = []
      const contacts_data = await contacts.json()
      contacts_data.map((element:any,index:number)=>{
        contacts_phones.push({'nome':element.pushName,'phone':element.id})
      })
      return contacts_phones.filter(e=>e)
    }catch(error){
      console.log(error)
      return [];
    }
  
  }
