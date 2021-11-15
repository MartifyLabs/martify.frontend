const fs = require('fs');
const express = require('express');
const cors = require('cors');

const api_create_txn = require('./api/create_txn.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: ["http://localhost:3000"]}));


/*
APIs
*/

function funcCaller(func, params){
  return new Promise((resolve, reject) => {
    try{
      func(params).then((data) => {
        resolve(data);
      })
    }catch(err){
      console.log("err", err)
      reject("")
    }
  });
}

app.post('/create_txn', function (req, res) {
  var body = req.body;
  // TODO payment recipient here
  body['recipient'] = "addr_test1qqveejhw3q2n8t4h2p4ewce4xw5wrhy5y3a3qe246we43l6qgaj22u0e95a42whvujn9gtu2s4q3fym764du9vdsp05qngsdll";
  funcCaller(
    api_create_txn.create_txn, body
  ).then((output) => {
    res.send(output);
  })
})



app.listen(4000)
