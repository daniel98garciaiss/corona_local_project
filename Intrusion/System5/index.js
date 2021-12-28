/* 
 *SECUROS INTEGRATION SERVER - INTRUSION MODULE - SYSTEM5
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/

//Integration using Contact ID

var net = require('net');
const csv = require('csvtojson')
const fs = require('fs');
const request = require('request');

var logname 				= "System5 Intrusion Integration";
var logs 		= require('../../logsset/logs');

var messages;

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////Heartbeat Function//////////////////////////////////////////
//Funcion para enviar cada 20 segundos un mensaje de ACK y mantener activa la comunicación//
////////////////////////////////////////////////////////////////////////////////////////////

setInterval(function(){
  var buff = Buffer.from([0x06]);
  client.write(buff);
  console.log("Hearthbeat");
  logs.Write("Hearthbeat","DEBUG",logname);
}, 20000);

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////Read Csv Function///////////////////////////////////////////
//Funcion que lee el csv en el que se almacena la traduccion de los codigos que se reciben//
////////////////////////////////////////////////////////////////////////////////////////////

read_csv(function(){
    console.log("Message CSV successfully read");
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////Abrir el cliente para ecuchar al servidor///////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
var client = new net.Socket();
client.connect(1027, '172.23.254.44', function() {
    console.log('Connected');
    logs.Write("Connected","INFO",logname);
});

////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////Recibir Datos////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

client.on('data', function(data) {
    var data0 = data.toString();
    console.log('Received: ' + data0);
    logs.Write("Received: "+data0,"DEBUG",logname);
  try
  {
    var pattern = /((\w|\s)*)-*?/ig;
    var data0 = data0.match( pattern );
    console.log("length: "+data0.length,"data 0: "+data0);
    var date = new Date(data0[0]+" "+data0[2]+":"+data0[4]+":"+data0[6]);
    var receptor = data0[14];
    var line = data0[16];
    var abonado = data0[18];
    var message = data0[20];
    var complement = data0[22];
    console.log(date,receptor,line,abonado,message,complement);
    logs.Write(date+"-"+receptor+"-"+line+"-"+abonado+"-"+message+"-"+complement,"DEBUG",logname);
    var [event,type] = find_message(message.toString());
            console.log(event,type);
            if(event==undefined)
                event="Evento no registrado";
            if(type==undefined)
                type="INFO";

            json = {
                "receiver":"01",
                "panel":abonado,
                "event_code":message,
                "comment":event,
                "event":type,
                "partition":abonado+"-"+receptor,
                "sensor":abonado+"-"+receptor+"-"+line
            }
            console.log(json);
            logs.Write("Json: "+JSON.stringify(json),"DEBUG",logname);
            sendSecurOS(json);
  } 
  catch(e)
  {
    console.log(e);
    logs.Write("ERROR: "+e,"ERROR",logname);
  } 
  //Enviar ACK
  var buff = Buffer.from([0x06]);
  client.write(buff);
  console.log("ACK");
  logs.Write("ACK","DEBUG",logname);
    //client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
});

//Convertir csv en json
function read_csv(callback)
{
    const csvFilePath='messages.csv';
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        console.log(jsonObj);
        messages=JSON.parse(JSON.stringify(jsonObj));
        callback(messages);
    })
}

//Buscar mensaje un json
function find_message(message_to_find)
{
    console.log("finding: "+message_to_find +"...")
    var found=0;
    var type=0;
    for(var i = 0 ; i<messages.length;i++)
    {
        if(messages[i].Message == message_to_find)
        {
            type = messages[i].Type
            found = messages[i].Alert;
            return  [found,type];
        }
        else
        {
            found = "not found";
            type = "ALARM";
        }
    }
    return  [found,type];
}

//Enviar mensaje a SecurOS
function sendSecurOS(json)
{
    var options = {
        'method': 'POST',
        'url': 'http://127.0.0.1:3018/api/securos/event',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json) //JSON.stringify({"receiver":"1","panel":"1752","cid":"18","event_code":"E401","comment":"not found","event":"ALARM","partition":"49","sensor":"1","type":"SENSOR","typeID":"1"})

        };
        try{
            request(options, function(error, response) {
                if (error) throw new Error(error);
                    console.log(response.body);
                    logs.Write("Response: "+response.body,"DEBUG",logname);

            });
        }
        catch{
            console.log("Error: There was a trouble sending events to SecurOS")
            logs.Write("Error: There was a trouble sending events to SecurOS","DEBUG",logname);
        }
        
}