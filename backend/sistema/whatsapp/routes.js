require('dotenv').config();
const whatsapp_router = require('express').Router()
const {formatPhoneNumber} = require('../essentials/formatPhoneNumber');
const {doDisparoWhatsapp} = require('./functions/doDisparoWhatsapp');
const {genQRCode} = require('./functions/genQRCode');
const {getWhatsappContactsByAPI} = require('./functions/getWhatsappContactsByAPI');
const {setDefaultConnectionConfig} = require('./functions/DefaultConnectionConfigs')
const {isWppConnected} = require('./functions/isWppConnected');
const {sendMessage} = require('./functions/sendMessage');
const {WppConnections} = require('./functions/WppConnections');
const {WppDeleteConnection} = require('./functions/WppDeleteConnection');
const {setInstanceWebSocket} = require('./functions/setInstanceWebSocket')
const CONNECTION_SOCKET_URL = (process.env.PROD_ENV==='TRUE')?(`wss://${process.env.WPPAPI_PROXY}`):(`ws://localhost:${process.env.WPPAPI_PORT}`);
const connection_socket = require("socket.io-client");
var store = require('store');
var Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();


whatsapp_router.get('/user_cache',async(req,res)=>{
    const user_name = req.user_name;
    var already_ended = store.get(`${user_name}_already_ended`);
    var is_disparing = store.get(`${user_name}_is_disparing`);
    var progress = store.get(`${user_name}_progress`);
    var n_fails = store.get(`${user_name}_fail`,0);
    var pause_status = store.get(`${user_name}_pause_status`);
    var stop_status = store.get(`${user_name}_stop_status`);
    res.status(200).send({'cache_is_disparing':is_disparing, 'cache_progress': progress, 'cache_n_fails': n_fails, 'cache_pause_status':pause_status , 'cache_stop_status': stop_status});
});


whatsapp_router.get('/reset_user_cache',async(req,res)=>{
    const user_name = req.user_name;
    store.set(`${user_name}_already_ended`,'nao');
    store.set(`${user_name}_is_disparing`,'nao');
    store.set(`${user_name}_progress`,'-/-');
    store.set(`${user_name}_user_name`,user_name);
    store.set(`${user_name}_fail`,0);
    store.set(`${user_name}_stop_status`, 'unstoped');
    store.set(`${user_name}_pause_status`, 'unpaused');
    res.status(200).end();
});


whatsapp_router.get('/stop_backend_disparing',async(req,res)=>{//isso é pra debug
    const user_name = req.user_name;
    store.set(`${user_name}_already_ended`,'nao');
    store.set(`${user_name}_is_disparing`,'nao');//progresso nao é resetado devido a assincronicidade com o sendprogress, ia mandar '-' pra disparo
    store.set(`${user_name}_user_name`,user_name);
    store.set(`${user_name}_fail`,0);
    store.set(`${user_name}_stop_status`, 'stop');
    store.set(`${user_name}_pause_status`, 'unpaused');
    res.status(200).end();
});



whatsapp_router.get('/get_how_many', async(req,res)=>{
    try{
        console.log(req.query)
        const {connection_name} = req.query;
        console.log('connection name')
        console.log(connection_name)
        if(!connection_name){
            res.status(404);
        }
        console.log(connection_name);
        const user_name = req.user_name;
        const response = await getWhatsappContactsByAPI(connection_name, user_name);
        console.log('TAMANHO')
        res.status(200).send({'total':response.length});
    }catch(error){
        console.log(error)
        res.status(500).end();
    }
})

whatsapp_router.post('/disparo', async (req,res)=>{
    console.log('DISPARO TRIGADO')
    try{
        const release = await mutex.acquire();
        const token = req.token;
        const user_name = req.user_name;
        const {disparo_type} = req.body;
        console.log('DISPARO TYPE')
        console.log(disparo_type)
        const {excel_contacts} = req.body;
        const {wooc_contacts} = req.body;
        const {connection_name} = req.body;
        const {message} = req.body;
        const {image_base64} = req.body;
        var {campaign_name} = req.body;
        var campaign_name = campaign_name?.replace(/\s+/g, ' ').trim();
        var {unfilter_how_many_to_disparo} = req.body;
        var {campaigns_to_exclude} = req.body;
        var {file_type} = req.body;

        var {interval_lower_bound, interval_upper_bound,number_to_trigger_pseudo_pause,pseudo_pause_lower_limit,pseudo_pause_upper_limit} = req.body;
        console.log('Configurações intervalares:')
        console.log([interval_lower_bound, interval_upper_bound,number_to_trigger_pseudo_pause,pseudo_pause_lower_limit,pseudo_pause_upper_limit]);
        if(!(pseudo_pause_upper_limit && pseudo_pause_lower_limit && number_to_trigger_pseudo_pause && interval_upper_bound && interval_lower_bound && disparo_type && connection_name && user_name  && message && campaign_name && ((disparo_type==='lista')?unfilter_how_many_to_disparo:true) && campaigns_to_exclude)){
            console.log('Algo nao passou');
            res.status(400).end();
            release();
            return;
        }

        if(disparo_type==='lista'){
            var contacts = await getWhatsappContactsByAPI(connection_name, user_name);
        }
        if(disparo_type==='excel'){
            console.log('É EXCEL')
            var contacts = excel_contacts.map((element)=>{
                return{
                    'nome':element.nome,
                    'phone': formatPhoneNumber((element.phone).toString())
                }
            })
            var contacts = contacts.filter(e=>e);
        }

        if(disparo_type==='e-commerce'){
            console.log('É ECOMMERCE')
            var contacts = wooc_contacts.map((element)=>{
                return{
                    'nome':element.nome,
                    'phone': formatPhoneNumber((element.phone).toString())
                }
            })
            var contacts = contacts.filter(e=>e);
            console.log('CONTATOS FORMATADOS')
            console.log(contacts)
        }
        console.log('DISPARO PRESTES A SER TRIGADO')
        doDisparoWhatsapp(file_type,disparo_type, contacts,user_name, connection_name, campaign_name, message, image_base64, campaigns_to_exclude, parseInt(unfilter_how_many_to_disparo),parseInt(interval_lower_bound), parseInt(interval_upper_bound),parseInt(number_to_trigger_pseudo_pause),parseInt(pseudo_pause_lower_limit),parseInt(pseudo_pause_upper_limit), token);
        res.status(200).end();
        release();
    }catch(error){
        console.log(error);
        res.status(500).end();
        release();
    }
})

whatsapp_router.get('/is_wpp_connected', async (req,res)=>{
    try{
        const token = req.token;
        const user_name = req.user_name;
        const {connection_name} = req.query
        console.log('NOME DA CONEXÃO')
        console.log(connection_name)
        if(!connection_name){
            res.status(400).end()
            return
        }
        const response = await isWppConnected(connection_name, user_name)
        console.log('STATUS DA CONEXÃO ENDPOINT')
        console.log(response)
        res.status(200).send(response)
    }catch(error){
        res.status(500).end()
        console.log(error)
        return
    }
})
  
whatsapp_router.post('/delete_connection', async (req,res)=>{
    try{
        console.log('DELETE CONNECTION TRIGGERED')
        const {connection_name} = req.body;
        console.log('CONNECTION NAME IN DELETE')
        console.log(connection_name)
        const user_name = req.user_name;
        const token = req.token;
        const deletion_process = await WppDeleteConnection(connection_name, user_name)
        res.status(200).end()
    }catch(error){
        res.status(500).end()
        console.log(error)
        return
    }
})
  
  // Create a connection to the database
  
whatsapp_router.get('/connections' , async (req,res)=>{
    try{
        const token = req.token;
        const user_name = req.user_name;
        const connections = await WppConnections()
        if(connections){
            const user_connections = connections.filter((e,i)=>e.includes(user_name))
            const frontend_user_connections = user_connections.map((e,i)=>{
                    const parts = e.split("_");
                    const lastUnderscoreIndex = e.lastIndexOf("_");
                    const firstPart = e.substring(0, lastUnderscoreIndex); // "admin_davi"
                    const secondPart = e.substring(lastUnderscoreIndex + 1); // "americo"
                    return secondPart;
            });
            console.log('CONEXÕES FRONTEND')
            console.log(frontend_user_connections)
            res.status(200).send(frontend_user_connections)
        }else{
            res.status(200).send('NENHUMA CONEXÃO')
        }
    }catch(error){
        res.status(500).end();
        console.log(error)
        return
    }
        
}) 
  
whatsapp_router.post('/qrcode', async (req, res) => {
    try {
        const user_name = req.user_name;
        const token = req.token;
        const { connection_name } = req.body;
        console.log(req.body.connection_name);
        const {statusCode,qr_base64} = await genQRCode(user_name, connection_name);
        setDefaultConnectionConfig(user_name,connection_name);
        // await setInstanceWebSocket(user_name,connection_name);

        //configurando websocket pro meu backend saber da conexão e salar contatos no bango de dados
        // const instance_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
        // console.log(`CONNECTION SOCKET URL ${CONNECTION_SOCKET_URL}/${instance_name}`)
        // const connection_socket_instance = connection_socket(`${CONNECTION_SOCKET_URL}/${instance_name}`, {
        //     transports: ["websocket"], // Specify that only WebSockets should be used
        // });
        // connection_socket_instance.on('connect',()=>{
        //     console.log(`conectado com sucesso ${instance_name}`);
        // });

        // connection_socket_instance.on('error',(error)=>{
        //     console.error("Erro na conexão:", error);
        // });

        res.status(statusCode).send(qr_base64); // Envie o status code de volta para o cliente
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(); // Se houver um erro, envie um status code 500
    }
});

module.exports={
    whatsapp_router
}
  
  