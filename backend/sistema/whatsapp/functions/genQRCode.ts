import dotenv from 'dotenv'; 
dotenv.config();
import fetch from 'node-fetch';
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`)

export const genQRCode = async (user_name:string, connection_name:string) => {
    try{
        const headers0 = {
            'accept': 'application/json',
            'apikey': `${process.env.WPPAPI_KEY}`,
            'Content-Type': 'application/json'
          };
        const instances_response = await fetch(`${WPPAPI_URL}/instance/fetchInstances`, {
            method: 'GET',
            headers: headers0
          });
        const instances = await instances_response.json()
        console.log('instancias')
        console.log(instances)
        console.log('testeeee')
        console.log(instances)
        console.log('tese2')

        instances.map(async (element:any,index:number)=>{
            if(element.instance?.status!='open'){
                console.log('IF ATENDIDO')
                await fetch(`${WPPAPI_URL}/instance/delete/${element.instance.instanceName}`, {
                    method: 'DELETE',
                    headers: headers0
                });
            }
        })
    }catch(error){
        const statusCode = 405
        return {statusCode}
    }

    //gerando qr code
    const instance_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
    
    const data = {
      instanceName: instance_name,
      token: Array(32).fill(null).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      qrcode: true
    };
  
    const headers = {
      'accept': 'application/json',
      'apikey': `${process.env.WPPAPI_KEY}`,
      'Content-Type': 'application/json'
    };
  
    try {
      const response = await fetch(`${WPPAPI_URL}/instance/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log(responseData);

      const qr_base64 = responseData.qrcode?.base64


      const statusCode = !(responseData.status)?200:(responseData.status)
  
      return {statusCode, qr_base64}; // Retorna o status code da resposta
    } catch (error) {
      console.error('Error:', error);
      const statusCode = 500;
      return {statusCode}; // Se houver um erro, retorna 500 (Erro interno do servidor)
    }
}