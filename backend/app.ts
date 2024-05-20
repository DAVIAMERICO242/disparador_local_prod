import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import {login_router} from './sistema/auth/login';
import {is_user_auth_to_see_painel_router} from './sistema/auth/authSeeFrontendPainel';
import {AuthBackendMiddleware} from './sistema/auth/authUseBackendAPI';
import {whatsapp_router} from './sistema/whatsapp/routes';
import {campaign_router} from './sistema/campaigns/routes';
import {woocommerce_router} from './sistema/woocommerce/routes';
import cors from 'cors';
import dotenv from 'dotenv'; 
dotenv.config();
const FRONT_END_URL = (process.env.PROD_ENV==='TRUE')?(`https://${process.env.FRONTEND_PROXY}`):(`http://localhost:${process.env.FRONTEND_PORT}`)

//REQUER TABELA disparos com moment,user,campaign, truthy_connection, contact_name,target_number
//REQUER TABELA users com user,pass,tel,email


app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(cors({
    origin: FRONT_END_URL,
    credentials: true
  }));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/',login_router);
app.use('/',is_user_auth_to_see_painel_router);


app.use('/',AuthBackendMiddleware, whatsapp_router);
app.use('/',AuthBackendMiddleware, campaign_router);
app.use('/',AuthBackendMiddleware, woocommerce_router);


app.listen(process.env.BACKEND_PORT,()=>{console.log(`escutando porta ${process.env.BACKEND_PORT}`)})