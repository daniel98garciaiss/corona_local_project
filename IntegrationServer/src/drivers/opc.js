const express = require('express');
const router = express.Router();
const request = require('request');
const { connect } = require('mongoose');
const Opc = require('../models/opc');
const opcConfig = require('../config/opc');
const Service = require('../models/service');
const socket = require('../index');

var logs = require('../logsNode/logs');

const realysDriver = require('./securos')

async function add(_id)
{
    read(_id);
    opcHealth(_id);
}

async function start()
{
   let opc = await Opc.find().lean();
   opc.forEach(element => {
      opcHealth(element._id);
   });
  logs.Write("Lectura de opcs iniciada en drivers/opc start","INFO","servidor de integraciones opcs");
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
    let options = {
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

function opcHealth(_id)
{
setInterval(function(){
   read(_id);
},10000)
}


async function read(_id)
{
    let opc = await Opc.findById(_id).lean();

    let service = await Service.findOne({ name: "opc" }).lean();

    // traer todos los opc para compar mas a adelante a ver si alguno fue modificado
    let opcsBeforeModifications = await Opc.find().lean().sort({name: 'ascending'});

    // console.log(opc)
    return new Promise(json => {
        let options = {
            'method': 'POST',
            'url': `http://${service.ip}:${service.port}${opcConfig.path}`,
            'headers': {
              'Content-Type': 'application/json'
            },
            body: `{"url":"${opc.url}"}`
        };

       

        request(options, async function (error, res) {
            if (error)
            {
                console.log('Servicio de OPC no responde, ', error);
                logs.Write("Servicio de OPC no responde en drivers/opc read","ERROR","servidor de integraciones opcs");
                let state = 'Desconectado';
                await Opc.findByIdAndUpdate(_id,{state}).lean();

                let newOpcs = await Opc.find().lean().sort({name: 'ascending'});
                socket.emit("modified-resourse",{newOpcs})
                return false;
            }
            let _json = await JSON.parse(res.body)
            if(_json.connect)
            {
                let state = (_json.connect === 'True') ? 'Conectado':'Desconectado';
                
                // if(_json.items){
                  let methods = _json.items;
                  // await Opc.findByIdAndUpdate(_id,{methods}).lean();
                  await Opc.findByIdAndUpdate(_id,{state,methods}).lean();
                // }
            }

            if(_json.items){
              let methods = _json.items;
              // await Opc.findByIdAndUpdate(_id,{methods}).lean();
              await Opc.findByIdAndUpdate(_id,{methods}).lean();
              _json.items = null;
            }

          let newOpcs = await Opc.find().lean().sort({name: 'ascending'});

          const opcsBeforeModifications_string = await asyncStringify(opcsBeforeModifications);
          const newOpcs_string = await asyncStringify(newOpcs);
          if(opcsBeforeModifications_string !== newOpcs_string){
            console.log("cambios en las variables del opc");
            logs.Write("Cambios en las variables del opc en drivers/opc read","INFO","servidor de integraciones opcs");
            socket.emit("modified-resourse",{newOpcs})
            await realysDriver.start();
          }
            // console.log(_json)
            logs.Write("Leyendo opc en drivers/opc read","INFO","servidor de integraciones opcs");

            json(_json)
        });    
    })  
}

async function asyncStringify(str) {
  return JSON.stringify(str);
}

//sin usar aun
async function write(_id,key,value)
{
    let opc = await Opc.findById(_id).lean();
    let service = await Service.findOne({ name: "opc" }).lean();

    //console.log(opc)
    let newValue = `{"url":"${opc.url}",
                 "var":"${key}",
                 "val":"${value}"
                }`

    return new Promise(json =>{
        let options = {
            'method': 'POST',
            'url': `http://${service.ip}:${service.port}${opcConfig.pathWrite}`,
            'headers': {
              'Content-Type': 'application/json'
            },
            body: newValue
        };

        request(options, async function (error, res) {
            if (error)
            {
                console.log('Servicio de OPC no responde, ', error);
                logs.Write("Escribiendo en opc server en drivers/opc write","ERROR","servidor de integraciones opcs");

                return false;
            }
            _json = JSON.parse(res.body)
            logs.Write("Escribiendo en opc server en drivers/opc write","INFO","servidor de integraciones opcs");
           
            // console.log(_json)
            json(_json)
        });    
    })  
}


exports.add = add;
exports.test = test;
exports.start = start;
exports.write = write;