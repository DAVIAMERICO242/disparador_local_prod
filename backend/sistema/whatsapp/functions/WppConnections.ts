import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch';
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`)

export const WppConnections = async()=>{
    const headers = {
        'accept': 'application/json',
        'apikey': `${process.env.WPPAPI_KEY}`,
        'Content-Type': 'application/json'
      };
    const response_connections = await fetch(`${WPPAPI_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: headers
      });
    console.log(response_connections)
    const data_connections = await response_connections.json()
    var connections = data_connections.map((element: any,index:number)=>{
        if(element.instance?.status=='open'){
            return (element.instance?.instanceName)
        }
      })
    var connections = connections.filter((e:any,i:number)=>e)
    console.log('CONEXÕES')
    console.log(connections)
    return connections
  }