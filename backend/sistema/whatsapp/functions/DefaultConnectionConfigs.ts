import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch'
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`);

export const setDefaultConnectionConfig = async(user_name:string, connection_name:string):Promise<any>=>{
    const server_connection_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
  
    const headers0 = {
      'accept': 'application/json',
      'apikey': `${process.env.WPPAPI_KEY}`,
      'Content-Type': 'application/json'
    };

    try{
        const default_conf = {
            "reject_call": false,
            "msg_call": false,
            "groups_ignore": true,
            "always_online": false,
            "read_messages": false,
            "read_status": false,
            "sync_full_history": true
          };

        const response = await fetch(`${WPPAPI_URL}/settings/set/${server_connection_name}`, {
          method: 'POST',
          headers: headers0,
          body: JSON.stringify(default_conf)
        });
        console.log('SAIDA DEFAULT CONFIG')
        console.log(await response.json())
      }catch(error){
        console.log(error)
      }

    if(process.env.WILL_PROXY==='TRUE'){
      try{
        const default_conf = {
            "enabled": true,
            "proxy": {
              "host":process.env.PROXY_HOST,
              "port":process.env.PROXY_PORT,
              "protocol":"http",
              "username":process.env.PROXY_USERNAME,
              "password":process.env.PROXY_PASSWORD
            }
          }
  
        const response = await fetch(`${WPPAPI_URL}/proxy/set/${server_connection_name}`, {
          method: 'POST',
          headers: headers0,
          body: JSON.stringify(default_conf)
        });
        console.log('SAIDA DEFAULT CONFIG')
        console.log(await response.json())
      }catch(error){
        console.log(error)
      }
      return true;
    }
}
