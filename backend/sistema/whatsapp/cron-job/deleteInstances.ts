import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch';
//(`http://localhost:${process.env.WPPAPI_PORT}`)
const WPPAPI_URL = "https://wpp-api.skyler.com.br";
const deleteAllInstances = async()=>{
    const headers = {
        'accept': 'application/json',
        'apikey': `NID239234JR809-34RIJ3R93FN23UY3812G`,
        'Content-Type': 'application/json'
      };
    const response_connections = await fetch(`${WPPAPI_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: headers
      });
    const all_connections = await response_connections.json();
    for(let k=0;k<all_connections.length;k++){
      var current_connection_name = all_connections[k]?.instance?.instanceName;
      await fetch(`${WPPAPI_URL}/instance/logout/${current_connection_name}`, {
        method: 'DELETE',
        headers: headers
      });
      await fetch(`${WPPAPI_URL}/instance/delete/${current_connection_name}`, {
        method: 'DELETE',
        headers: headers
      });
    }
    console.log(all_connections);
}

deleteAllInstances();
