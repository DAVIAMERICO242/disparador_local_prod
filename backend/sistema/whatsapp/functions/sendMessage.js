require('dotenv').config();
const fetch = require('node-fetch');
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`)
const {recordCampaignOnSentMessage} = require('../../campaigns/manage_database_campaigns');
var Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

const sendMessage = async(file_type,connection_name, user_name,target_phone,message, image_base64)=>{
    const release = await mutex.acquire();

    console.log(user_name)
    console.log(connection_name)
    console.log(target_phone)
    console.log(message)
  
    const headers0 = {
      'accept': 'application/json',
      'apikey': `${process.env.WPPAPI_KEY}`,
      'Content-Type': 'application/json'
    };
  
    const server_connection_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
  
  
    try{
      if(image_base64){//mensagem com imagem colada
        console.log('COM IMAGEM')
        parameters = {
          "number": target_phone,
          "mediaMessage":{
            "mediatype": file_type,
            "caption": message,
            "media": image_base64.split(',')[1]
          }
        }
        const response = await fetch(`${WPPAPI_URL}/message/sendMedia/${server_connection_name}`, {
          method: 'POST',
          headers: headers0,
          body: JSON.stringify(parameters)
        });

        if (response.status===400) {
          // Check if the response status is not within the 200-299 range
          throw new Error(`HTTP error! Status: ${response.status}`);
        }else{
          release();
          recordCampaignOnSentMessage(user_name,connection_name, "ignore", "ignore", target_phone, message ,"inner_sendMessage_disp");
        }
  
        console.log(await response.json())
  
      }else{//mensagem normal
          console.log('SEM IMAGEM')
          parameters = {
            "number": target_phone,
            "textMessage": {
              "text": message
            }
          }
          const response = await fetch(`${WPPAPI_URL}/message/sendText/${server_connection_name}`, {
            method: 'POST',
            headers: headers0,
            body: JSON.stringify(parameters)
          });

          if (response.status===400) {
            // Check if the response status is not within the 200-299 range
            throw new Error(`HTTP error! Status: ${response.status}`);
          }else{
            release();
            recordCampaignOnSentMessage(user_name,connection_name, "ignore", "ignore", target_phone, message ,"inner_sendMessage_disp");
          }
  
          console.log(await response.json())
          console.log('NAO TRIGOU EXCEPTION KKKKKKKKKKKKKKKKKKKK')
  
      }
      return true
    } catch(error){//verificar problema do 9 na frente
        console.log('CAIU NO CATCH')
        console.log('com whatsanet')
        console.log(target_phone)
        console.log('sem whatsnet')
        console.log(target_phone.split('@')[0])
        if((target_phone.split('@')[0]).length===12){
          console.log('12')
          parameters.number = target_phone.slice(0, 4) + '9' + target_phone.slice(4);
        }
        if((target_phone.split('@')[0]).length===13){
          console.log('13')
          parameters.number = target_phone.slice(0,4) + target_phone.slice(5);
        }
        console.log('REDEFINIDO')
        try{
          var last_attempt = await fetch(`${WPPAPI_URL}/message/${image_base64?'sendMedia':'sendText'}/${server_connection_name}`, {
            method: 'POST',
            headers: headers0,
            body: JSON.stringify(parameters)
          })


          if (last_attempt.status===400) {
            console.log('ERRO AO TENTAR NOVAMENTE')
            // Check if the response status is not within the 200-299 range
            throw new Error(`HTTP error! Status: ${last_attempt.status}`);
          }else{
            release();
            recordCampaignOnSentMessage(user_name,connection_name, "ignore", "ignore", target_phone, message ,"inner_sendMessage_disp");
          }

          return true;
        }catch(error){
          release();
          console.log(error)
          return false
        }
    }
}

module.exports={
  sendMessage
}