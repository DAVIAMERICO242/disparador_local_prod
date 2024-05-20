// require('dotenv').config();
// const fetch = require('node-fetch');
// const WPPAPI_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.WPPAPI_PROXY}`):(`http://localhost:${process.env.WPPAPI_PORT}`);
// const setInstanceWebSocket = async (user_name, connection_name) => {
//     try{
//         const instance_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();
//         const headers0 = {
//             'accept': 'application/json',
//             'apikey': `${process.env.WPPAPI_KEY}`,
//             'Content-Type': 'application/json'
//           };
//         const body0 = JSON.stringify({
//             enabled: true,
//             events: ['QRCODE_UPDATED'] // Substitua 'string' pelo evento que você deseja habilitar
//         });
//         const response = await fetch(`${WPPAPI_URL}/websocket/set/${instance_name}`, {
//             method: 'POST',
//             headers: headers0,
//             body:body0
//           });
//         }catch(error){
//             console.log(error)
//         }
// }

// console.log('oi')
// const instance_name = 'admin_dfgfdg'
// const connection_socket = require("socket.io-client");
// console.log('a')
// const connection_socket_instance = connection_socket(`ws://localhost:8081/${instance_name}`, {
//     transports: ["websocket"], // Specify that only WebSockets should be used
// });
// console.log('f')
// connection_socket_instance.on('connect',()=>{
//     console.log(`conectado com sucesso ${instance_name}`);
// });
// connection_socket_instance.on('error',(error)=>{
//     console.log('erro')
//     console.error("Erro na conexão:", error);
// });
// console.log('a')