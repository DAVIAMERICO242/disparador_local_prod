const login_router = require('express').Router()
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const secretKey = 'yJNIDJ8329D0'; // Change this to a secure random key
require('dotenv').config();

login_router.get('/auth', (req, res) => {
    console.log('entrou')
    // Perform SQL query
    const connection = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME
    });
    
    // Connect to the database
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return;
      }
      const query = 'SELECT * FROM users WHERE user = ? AND pass = ?';
      console.log('Connected to database!');
      var {user,pass} = req.query
      console.log(user)
      console.log(pass)
      if(!(user && pass)){
          res.status(404).send('UNAUTHORIZED')
          return;
      }
      connection.query(query, [user, pass], (error, results, fields) => {
        if (error) {
          res.status(500).end()//por logica de reiniciar o servidor
          return;
        }else{
          const userMatch = results.find(row => row.user===user && row.pass===pass);
          if(!userMatch){
              res.status(404).end()
              return;
          }
        }
        const token = jwt.sign({ username: user }, secretKey, { expiresIn: 60 * 60 * 24 * 7 })
        res.status(200).json({token})
        connection.end((err) => {
          if (err) {
            console.error('Error closing database connection:', err);
            return;
          }
          console.log('Connection to database closed.');
        });
      });
    });
  });

module.exports={
    login_router
}
