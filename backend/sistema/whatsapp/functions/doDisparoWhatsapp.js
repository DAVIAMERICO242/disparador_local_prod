const whatsapp = require('express').Router()
const mysql = require('mysql');
require('dotenv').config();
const fetch = require('node-fetch');
const {recordCampaignOnSentMessage, NumbersFromExcludedCampaigns} = require('../../campaigns/manage_database_campaigns');
const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`);
const url = require('url');
const WebSocket = require('ws'); // Assuming you're using WebSocket library
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT }); // Example port number
var store = require('store');
const {sendMessage} = require('./sendMessage');
const {sleep} = require('../../essentials/sleep')
const {randomBetween} = require('../../essentials/randomBetween')
const {formatPhoneNumber} = require('../../essentials/formatPhoneNumber');
const secretKey = 'yJNIDJ8329D0'; // Change this to a secure random key
const jwt = require('jsonwebtoken');

//abaixo configuro o websocket e o progresso do disparador
console.log('WEB SOCKET A SER RECONFIGURADO');
wss.on('connection', function connection(ws, req) {
  try{
    const location = url.parse(req.url, true);
    console.log('LOCATION')
    console.log(location)
    const token = location.query.token;
    const decoded = jwt.verify(token, secretKey);
    const user = decoded.username;
    console.log("USER:", user);
    console.log('PARAMS')
    console.log(req.user)
    console.log('TOKEN DETECTADO NA CONEXÃO')
    console.log(user)
    ws.user = user; // Store token as a property of the WebSocket object
  
    ws.on('message', function incoming(message) {//envia o que ta em memoria
      var progress_backup = store.get(`${user}_progress`);
      var user_name_backup = store.get(`${user}_user_name`);
      var fail_backup = store.get(`${user}_fail`);

      //O SEND PROGRESS NOS PAUSE É NECESSARIO PARA COMUNICAR A QUALQUER USUARIO LOGADO O ESTADO DE PAUSE, E OS BACKUPS É PRA MANTER A CONSISTENCIA DOS DADOS NO PROGRESSO E NAO BUGAR OS ESTADOS NO FRONTEND
      if (message === 'pause') {
        console.log('PAUSE')
        sendProgress(progress_backup, user_name_backup, fail_backup, author='pause');//ordem importa
        try{
          store.set(`${user}_pause_status`, 'paused');
          console.log(store.get(`${user}_pause_status`));
        }catch(error){
          console.log(error);
        }
      }
      if (message === 'unpause') {
        console.log('UNPAUSE');
        sendProgress(progress_backup, user_name_backup, fail_backup, author='unpause');
        try{
          store.set(`${user}_pause_status`, 'unpaused');
        }catch(error){
          console.log(error)
        }
      }
  
      if(message === 'stop'){
        console.log('SERVIDOR RECEBEU REQUISIÇÃO DE STOP');
        console.log(`${user}_stop_status`);
        sendProgress(progress_backup, user_name_backup, fail_backup, author='stop');
        try{
          store.set(`${user}_stop_status`, 'stop');
        }catch(error){
          console.log(error)
        }
      }
    });
  }catch{
    console.log('Erro ao conectar web socket verifique autenticação');
  }
  
    // Your other WebSocket handling logic...
});

//abaixo eu defino o disparador em si

function sendProgress(progress, user_name, fail, author) {//progresso disparo

    console.log('AUTHOR');
    console.log(author)
    store.set(`${user_name}_progress`,progress);
    store.set(`${user_name}_user_name`,user_name);
    store.set(`${user_name}_fail`,fail);
    wss.clients.forEach((client) => {
      console.log('USER DO CLIENTE')
      console.log(client.user)
      if (client.readyState === WebSocket.OPEN && client.user === user_name) {
        client.send(JSON.stringify({ 'web_socket_user': user_name, 'disparo_progress': progress, 'falhas':fail, 'author':author}));
      }
    });
    if(author==='disparo_for_loop' && (parseInt((progress)?.split('/')[0]) + parseInt((fail)?(fail):'0')) === parseInt((progress)?.split('/')[1])){//prestar atenção no caso de -/-
      console.log('ESTADO REINICIADO INESPERADAMENTE');
      store.set(`${user_name}_already_ended`,'sim');
      store.set(`${user_name}_is_disparing`,'nao');
      store.set(`${user_name}_progress`,'-/-');
      store.set(`${user_name}_user_name`,user_name);
      store.set(`${user_name}_fail`,0);
      store.set(`${user_name}_stop_status`, 'unstoped');
      store.set(`${user_name}_pause_status`, 'unpaused');
    }
    if(author==='stop'){
      store.set(`${user_name}_already_ended`,'sim');
      store.set(`${user_name}_is_disparing`,'nao');
      store.set(`${user_name}_progress`,'-/-');
      store.set(`${user_name}_user_name`,user_name);
      store.set(`${user_name}_fail`,0);
      store.set(`${user_name}_stop_status`, 'stop');
      store.set(`${user_name}_pause_status`, 'unpaused');
    }
}


const doDisparoWhatsapp = async (file_type,disparo_type,contacts,user_name, connection_name, campaign_name, message, image_base64, campaigns_to_exclude, unfilter_how_many_to_disparo,interval_lower_bound, interval_upper_bound,number_to_trigger_pseudo_pause,pseudo_pause_lower_limit,pseudo_pause_upper_limit, token)=>{
  
    try{
        //backup
        store.set(`${user_name}_already_ended`,'nao');
        store.set(`${user_name}_is_disparing`,'sim');
        store.set(`${user_name}_progress`,'-/-');
        store.set(`${user_name}_user_name`,user_name);
        store.set(`${user_name}_fail`,0);
        //backup^
        store.set(`${user_name}_stop_status`, 'unstoped');
        store.set(`${user_name}_pause_status`, 'unpaused');
        console.log('DISPARO TYPE')
        console.log(disparo_type)
        console.log('LOCAL STORAGE NAO ATUALIZANDO');
        console.log(store.get(`${user_name}_stop_status`));
        console.log('ENTROU NA FUNÇÃO DISPARO');
        console.log(`Usuário que solicitou o disparo:${user_name}`)
        console.log(`Nome da campanha: ${campaign_name}}`);
        console.log(`Conexão escolhida: ${connection_name}`);
        console.log(`Número de contatos a serem disparados (sem filtrar campanha): ${unfilter_how_many_to_disparo}`);
        console.log(`Campanhas excluídas: ${campaigns_to_exclude}`);
        console.log(`Mensagem a ser disparada: ${message}`);
        // console.log(`Imagem a ser disparada: ${image_base64}`);
        console.log('CONFIGURAÇÃO INTERVALOS DENTRO DO DODISPARO FUNC');
        console.log([interval_lower_bound, interval_upper_bound,number_to_trigger_pseudo_pause,pseudo_pause_lower_limit,pseudo_pause_upper_limit]);
        if(!interval_lower_bound){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
        if(!interval_upper_bound){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
        if(interval_lower_bound>=interval_upper_bound){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
        if(!pseudo_pause_lower_limit){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
        if(!pseudo_pause_upper_limit){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
        if(pseudo_pause_lower_limit>=pseudo_pause_upper_limit){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }

        var aux_to_unique = [];
  
        var unique_contacts = contacts.map((ele)=>{
          console.log('tel atual')
          console.log(ele.phone)
          if(!(aux_to_unique.includes(ele.phone))){
            aux_to_unique.push(ele.phone);
            return ele;
          }
        });

        var unique_contacts = unique_contacts.filter((e)=>(e));

        console.log('unique contacts');
        console.log(unique_contacts);
  
  
        if(campaigns_to_exclude.length){
          console.log('VALOR APROVADO');
          console.log(campaigns_to_exclude);
          const excluded_numbers = await NumbersFromExcludedCampaigns(user_name, campaigns_to_exclude);
          const campaign_filtered_numbers = unique_contacts?.filter(item => !(excluded_numbers.includes(item.phone)));
          var unique_contacts = campaign_filtered_numbers;
        }
  
        console.log('LEN HOW MANY TO DISPARO')
        console.log(unfilter_how_many_to_disparo.length)
        console.log('LEN UNIQUE CONTACTS')
        console.log(unique_contacts.length)
  
        if(unfilter_how_many_to_disparo<=unique_contacts.length && disparo_type==='lista'){
          console.log('entrou sim')
          var unique_contacts = unique_contacts?.slice(0, unfilter_how_many_to_disparo);
        }
  
        if(!(unique_contacts.length)){
          store.set(`${user_name}_is_disparing`,'nao');
          return;
        }
  
        const iterateContacts = async () => {
          console.log('Contatos')
          console.log(unique_contacts)
          var fail = 0;
          var send_process = false;
          for (let index = 0; index < unique_contacts.length; index++) {
            while(store.get(`${user_name}_pause_status`)==='paused'){
              if(store.get(`${user_name}_stop_status`)==='stop'){
                store.set(`${user_name}_stop_status`, 'unstoped');
                store.set(`${user_name}_is_disparing`,'nao');
                console.log('DISPARO MORTO')
                // sendProgress((index).toString() + '/' + (unique_contacts.length).toString(), user_name, true);
                return;
              }
              console.log('USUARIO PAUSOU')
              await sleep(3000);
            }
            if(store.get(`${user_name}_stop_status`)==='stop'){
              store.set(`${user_name}_is_disparing`,'nao');
              store.set(`${user_name}_stop_status`, 'unstoped');
              console.log('Disparo stopado');
              // sendProgress((index).toString() + '/' + (unique_contacts.length).toString(), user_name, fail, true);
              return;
            }
            try{
              if(unique_contacts[index].nome){
                var message_with_client_name = message.replace('{nome_do_cliente}',`*${unique_contacts[index].nome}*`);
              }else{
                var message_with_client_name = message.replace('{nome_do_cliente} ','');
                var message_with_client_name = message.replace(' {nome_do_cliente}','');
                var message_with_client_name = message.replace('{nome_do_cliente}','');
              }
              var send_process = await sendMessage(file_type,connection_name, user_name, unique_contacts[index].phone,message_with_client_name, image_base64);
            }catch(error){
              fail = fail + 1;
              console.log('falhas')
              console.log(fail);
            }
            if(!send_process){
              fail = fail + 1;
              console.log('falhas')
              console.log(fail);
            }//aqui
            sendProgress((index + 1 - fail).toString() + '/' + (unique_contacts.length).toString(), user_name, fail, author='disparo_for_loop');
            await sleep(1000*randomBetween(interval_lower_bound,interval_upper_bound));
            console.log('DIVIDEND')
            console.log(number_to_trigger_pseudo_pause)
            if((index + 1 - fail)%number_to_trigger_pseudo_pause===0 && (index + 1 - fail)){
              await sleep(1000*randomBetween(pseudo_pause_lower_limit,pseudo_pause_upper_limit));
            }
            try{
              await recordCampaignOnSentMessage(user_name,connection_name, campaign_name, unique_contacts[index].nome || 'desconhecido', unique_contacts[index].phone, message, "disp_for_loop");
            }catch(error){
              console.log(error)
            }
          }
          if(store.get(`${user_name}_already_ended`)!=='sim'){
            store.set(`${user_name}_is_disparing`,'nao');
            store.set(`${user_name}_progress`,'-/-');
            store.set(`${user_name}_user_name`,user_name);
            store.set(`${user_name}_fail`,0);
            store.set(`${user_name}_stop_status`, 'unstoped');
            store.set(`${user_name}_pause_status`, 'unpaused');
          }
        }
        iterateContacts();
    }catch(error){
      store.set(`${user_name}_is_disparing`,'nao');
      store.set(`${user_name}_progress`,'-/-');
      store.set(`${user_name}_user_name`,user_name);
      store.set(`${user_name}_fail`,0);
      store.set(`${user_name}_stop_status`, 'unstoped');
      store.set(`${user_name}_pause_status`, 'unpaused');
      console.log(error);
    }
  }

module.exports={
  doDisparoWhatsapp
}
  