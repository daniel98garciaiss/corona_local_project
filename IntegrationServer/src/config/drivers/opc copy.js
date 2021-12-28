const express = require('express');
const router = express.Router();
const request = require('request');
const { connect } = require('mongoose');
const opcModel = require('../models/opc');
const opcConfig = require('../config/opc');

class Opc extends EventEmitter {
  
  add(_id)  {
      var opc = await opcModel.findById(_id).lean();
      console.log(opc)
      return new Promise(json =>{
          var options = {
              'method': 'POST',
              'url': `http://${opcConfig.ip}:${opcConfig.port}${opcConfig.path}`,
              'headers': {
                'Content-Type': 'application/json'
              },
              body: `{"url":"${opc.url}"}`
          };
  
          request(options, async function (error, res) {
              if (error)
              {
                  console.log('Servicio de OPC no responde, ', error);
                  return;
              }
              _json = JSON.parse(res.body)
              if(_json.connect)
              {
                  var state = (_json.connect === 'True') ? 'Conectado':'Desconectado';
                  await opcModel.findByIdAndUpdate(_id,{state,methods});
              }
              if(_json.items){
              var methods = _json.items;
              await opcModel.findByIdAndUpdate(_id,{methods});
              }
              console.log(_json)
              json(_json)
          });
      })  
  }
  
}

x = {
  aInternal: 10,
  aListener: function(val) {},
  set a(val) {
    if(val!=this.aInternal){
      this.aInternal = val;
      this.aListener(val);
    }
  },
  get a() {
    return this.aInternal;
  },
  registerListener: function(listener) {
    this.aListener = listener;
  }
}

x.registerListener(function(val) {
  console.log("Someone changed the value of x.a to " + val);
});

function test()
{
  x.a = 20;
    var options = {
      'method': 'POST',
      'url': 'http://127.0.0.1:3001/api/securos/event',
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"type":"GENERIC_SENSOR","id":"1","action":"ALARMED"})

    };
    /*request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });*/
}

exports.add = add;
exports.test = test;