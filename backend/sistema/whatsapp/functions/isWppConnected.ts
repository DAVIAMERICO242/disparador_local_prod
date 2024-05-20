import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch'
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`)

export const isWppConnected = async(connection_name:string, user_name:string)=>{
    const headers0 = {
        'accept': 'application/json',
        'apikey': `${process.env.WPPAPI_KEY}`,
        'Content-Type': 'application/json'
      };

    const server_connection_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
    const is_connected_resp = await fetch(`${WPPAPI_URL}/instance/connectionState/${server_connection_name}`, {
        method: 'GET',
        headers: headers0
      });

    const is_connected = await is_connected_resp.json()
    console.log('STATUS DA CONEXÃO')
    console.log(is_connected)
    return is_connected
}