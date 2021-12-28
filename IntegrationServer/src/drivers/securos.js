const express = require('express');
const router = express.Router();
const request = require('request');
const { connect } = require('mongoose');
const Relay = require('../models/securos');
const securosConfig = require('../config/securos');
const Opc = require('../models/opc');

var logs = require('../logsNode/logs');

async function add(_id)
{
    monitoring_relay_key(_id);
    relayHealth(_id);
}

function relayHealth(_id)
{
    // setInterval(function(){
        monitoring_relay_key(_id);
    // },10000)

}

async function start()
{
   var relay = await Relay.find().lean();
   relay.forEach(element => {
    relayHealth(element._id);
   });
   console.log("Monitoriando reles")

  logs.Write("Lectura de reles iniciada en driver/securos start","INFO","servidor de integraciones opcs");

}

async function monitoring_relay_key(_id)
{
    // console.log("monitoring_relay_key")
    //logs.Write("Monitoriando rele en driver/securos monitoring_relay_key","INFO","servidor de integraciones opcs");

    //    var opc = await Opc.findById(_id).lean();
       var relay = await Relay.findById(_id).lean();

       Object.entries(relay.actions[0]).forEach(async([key, action]) =>{

        var opc = await Opc.findById(action.server).lean();
    // console.log("---------------------------------------------------------"  )
    // console.log("key:"+key)

    // console.log("opc:"+opc.methods[0][action.key] )
    // console.log("relay:"+action.value)
    // console.log("state:"+action.state)
        if(opc){
            
            if(key == "ON"){
                // compare the value bettwen a opc metodhs specific and relay action
                if(opc.methods[0][action.key] == action.value){   //budget int2 == ON.value
                    if(!action.state){
                        // console.log("ENVIADO ON")
                        send_event(
                                {
                                        "type": "GENERIC_RELAY",
                                        "typeID": relay.typeID,
                                        "event":  key,
                                    }
                                )
                            }
                        var json = relay;
                        json.actions[0].ON.state = true;
                        // console.log("estado modificado a verdadero en ON")
                        await Relay.findByIdAndUpdate(_id,json)
                }else{
                        var json = relay;
                        json.actions[0].ON.state = false;
                        // console.log("estado modificado a falso en ON")
                        await Relay.findByIdAndUpdate(_id,json)
                }
            }
            if(key == "OFF"){
                    // compare the value bettwen a opc metodhs specific and relay action
                    if(opc.methods[0][action.key] == action.value){   //budget int2 == ON.value
                        if(!action.state){
                            // console.log("ENVIADO OFF")
                            send_event(
                                    {
                                            "type": "GENERIC_RELAY",
                                            "typeID": relay.typeID,
                                            "event":  key,
                                        }
                                    )
                                }
                            var json = relay;
                            json.actions[0].OFF.state = true;
                            // console.log("estado modificado a verdadero en OFF")
                            await Relay.findByIdAndUpdate(_id,json)
                    }else{
                            var json = relay;
                            json.actions[0].OFF.state = false;
                            // console.log("estado modificado a falso en OFF")
                            await Relay.findByIdAndUpdate(_id,json)
        
                    }
            }
        }

    })
}


async function send_event(Body){
    return new Promise(json =>{
        var options = {
            'method': 'POST',
            'url': `http://${securosConfig.ip}:${securosConfig.port}${securosConfig.path}`,
            'headers': {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify(Body)
            
        };

        request(options, async function (error, res) {
            if (error)
            {
                console.log('Sevirdor securos no responde, ', error);
                logs.Write("Sevirdor securos no responde en driver/securos send_event","ERROR","servidor de integraciones opcs");

                return false;
            }

            _json = JSON.parse(res.body)
            logs.Write("Sevirdor securos respuesta exitosa en driver/securos send_event","INFO","servidor de integraciones opcs");
            
            console.log(_json)
        });    
    }) 
}

exports.add = add;
exports.start = start;
exports.monitoring_relay_key = monitoring_relay_key;
