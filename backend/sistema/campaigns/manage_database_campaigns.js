const mysql = require('mysql');
require('dotenv').config();

const AllCampaignColumns = async(user_name,campaigns) =>{
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        });

        console.log('USERNAME DENTRO DE CAMPAIGNS');
        console.log(user_name);
        const query = `SELECT * FROM disparos WHERE user=? AND campaign IN (?) AND campaign!='ignore' ORDER BY campaign`;
        const values = [user_name,campaigns];
        const campaigns_output = [];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                return;
            }
            results.forEach(row => {
                if(row.target_number && row.moment && row.truthy_connection){
                    const timestamp = row.moment;
                    const date = new Date(timestamp);
                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                    
                    const lastUnderscoreIndex = row.truthy_connection.lastIndexOf("_");
                    const frontend_connection = row.truthy_connection.substring(lastUnderscoreIndex + 1); // "americo"
                    console.log(formattedDate); // Output: "12/04/2024"
                    campaigns_output.push({'Data':formattedDate,'Campanha':row.campaign, 'Conexão': frontend_connection, 'Nome contato': row.contact_name , 'Número disparado': row.target_number.split('@')[0] });
                }
            });
            console.log('CAMPANHAS');
            console.log(campaigns_output)
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    reject(err);
                    return;
                }
                console.log('Connection closed successfully.');
                resolve(campaigns_output);
            });
        });
    });
}

const DeleteCampaigns = async(user_name,campaigns) =>{

    console.log('NOME USUARIO')
    console.log(user_name)
    console.log('CAMPANHAS A SEREM DELETADAS BACKEND')
    console.log(campaigns)
    return new Promise((resolve,reject)=>{
        try{
            const connection = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME
            });
            connection.on('error', (err) => {
                // Handle the error here
                reject(null);
            });
            const query = `DELETE FROM disparos WHERE user=? AND campaign IN (?)`;
            const values = [user_name,campaigns];
            connection.query(query, values, (error, results, fields) => {
                if (error) {
                    console.error('Error executing query:', error);
                    reject(error);
                    return;
                }
                connection.end((err) => {
                    if (err) {
                        console.error('Error closing connection:', err);
                        reject(err);
                        return;
                    }
                    console.log('Connection closed successfully.');
                    resolve(null);
                });
                });
        }catch(error){
            reject(error);
        }
    })

}


const Campaigns = async (user_name) =>{
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        });

        console.log('USERNAME DENTRO DE CAMPAIGNS');
        console.log(user_name)
        const query = `SELECT DISTINCT campaign FROM disparos WHERE user=? AND campaign!='ignore' ORDER BY campaign`;
        const values = [user_name];
        const campaigns = [];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                return;
            }
            results.forEach(row => {
                campaigns.push(row.campaign);
            });
            console.log('CAMPANHAS');
            console.log(campaigns)
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    reject(err);
                    return;
                }
                console.log('Connection closed successfully.');
                resolve(campaigns);
            });
        });
    });
}

const NumbersFromExcludedCampaigns = async (user_name, campaigns_to_exclude) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASS,
            database: process.env.DATABASE_NAME
        });

        const query = `SELECT DISTINCT target_number FROM disparos WHERE user=? AND campaign IN (?) AND campaign!='ignore'`;
        const values = [user_name, campaigns_to_exclude];
        const blocked_numbers = [];

        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                return;
            }
            results.forEach(row => {
                blocked_numbers.push(row.target_number);
            });
            console.log('BLOCKED NUMBERS')
            console.log(blocked_numbers)
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    reject(err);
                    return;
                }
                console.log('Connection closed successfully.');
                resolve(blocked_numbers);
            });
        });
    });
};

const recordCampaignOnSentMessage = async (user_name,connection_name, campaign_name,contact_name ,target_number, message ,district)=>{
    try{
        const currentDate = new Date();

    // Format the date and time as needed for SQL (assuming MySQL format)
        const moment = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        
        const server_connection_name = user_name?.toString() + '_' + (connection_name?.replace(/\s+/g, ' ')?.trim())?.toString();

        if(district!=='evolution_bf_send' && district!=='evolution_aft_send'){
            var connection = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASS,
                database: process.env.DATABASE_NAME
            });
        }else{
            var connection = mysql.createConnection({//o projecto evolution nao reconhece o env do meu backend
                host: 'skyler.com.br',
                port: '3306',
                user: 'disparadorUSER',
                password: '896321574',
                database: 'disparadorDB'
            });
        }

        connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    return;
                }
                const query = `INSERT INTO disparos(moment, user, campaign, truthy_connection,contact_name ,target_number, message ,district) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [moment, user_name, campaign_name, server_connection_name, contact_name,target_number, message ,district];
                connection.query(query, values, (error, results, fields) => {
                    if (error) {
                        console.error('Error executing query:', error);
                        return;
                    }
                    // Handle successful insertion
                    console.log('Campaign saved successfully.');
                    
                    // Close the connection
                    connection.end((err) => {
                        if (err) {
                            console.error('Error closing connection:', err);
                            return;
                        }
                        console.log('Connection closed successfully.');
                    });
                });
        });
    }catch(error){
        console.log(error)
    }
}

module.exports = {
    AllCampaignColumns,DeleteCampaigns,recordCampaignOnSentMessage, NumbersFromExcludedCampaigns, Campaigns
}

