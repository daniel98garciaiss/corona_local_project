/* 
 *SECUROS INTEGRATION SERVER - INTRUSION MODULE - D6100 Bosch
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/
const csv = require('csvtojson');
var request = require('request');
var udp = require('dgram');
var buffer = require('buffer');
var client = udp.createSocket('udp4');
var data = Buffer.from('siddheshrane');
const message = Buffer.from('Some bytes');

var logname 				= "Bosch Intrusion Integration";
var logs 		= require('../../logsset/logs');

read_csv(function(){
    console.log("Message CSV successfully read");
    
    client.bind(10000);
    console.log('Connected');
    logs.Write("Client connected","INFO",logname);
});


client.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  logs.Write("Error: "+ err,"ERROR",logname);
  //client.close();
});

client.on('message', (msg, rinfo) => {
    var data1 = Buffer.from(msg).toString('utf8');
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}, ${rinfo.size}, ${rinfo.family},${data1}`);
  logs.Write("server got: "+msg,"DEBUG",logname);
  logs.Write(`from ${rinfo.address}:${rinfo.port}, ${rinfo.size}, ${rinfo.family},${data1}`,"DEBUG",logname);
  var data2 = data1.split(' ');
  console.log(data2.length);
  logs.Write("data2 length: "+data2.length,"TRACE",logname);	
  console.log("ACK General message");
  logs.Write("ACK Generalmessage","TRACE",logname);
  var buff = Buffer.from([6]);
  client.send(buff, 7700, '172.23.254.43', (err) => { });

  if(data2.length>2)
  {
    var sin_espacios = data1.replace(/\s+/g, ' ');
	if(sin_espacios.includes("@"))
	{
    		console.log("ACK message");
            logs.Write("ACK message","TRACE",logname);
    		var buff = Buffer.from([6]);
    		client.send(buff, 7700, '172.23.254.43', (err) => { });
	}
    else if(sin_espacios.includes("X"))
	{
    		console.log("internal message");
            logs.Write("Internal message","DEBUG",logname);
    		var buff = Buffer.from([6]);
    		client.send(buff, 7700, '172.23.254.43', (err) => { });
	}
	else
	{
		var mod3 = sin_espacios.split(' ');
        if(mod3.length==4)
        {
            console.log("Modem3")
            logs.Write("Modem 3","DEBUG",logname);
            var panel = mod3[1];
            var type = mod3[2];
            var sensor = mod3[3];
            sensor = JSON.stringify(sensor).replace(/[\\u]/g, "");
            sensor = sensor.replace("0014", "");
            sensor = sensor.replace('"', "");
            sensor = sensor.replace('"', "");
            console.log("panel:",panel,"type:",type,"sensor:",sensor)
            logs.Write("panel:",panel,"type:",type,"sensor:",sensor,"DEBUG",logname);
            var event="Desconocido";
            if(type=="R")
            {
                event = "RESTAURADO"
            }
            else if(type=="A")
            {
                event = "ALARMADO"
            }
            else if(type=="C")
            {
                event = "CERRADO"
            }
            else if(type=="O")
            {
                event = "ABIERTO"
            }
            json = {
                "event_code":"-",
                "comment":event,
                "event":type,
                "type": "SENSOR",
                "typeID": panel+"-0-"+sensor
            }
            console.log(json);
            logs.Write("json: "+JSON.stringify(json),"DEBUG",logname);
            var options = {
            'method': 'POST',
            'url': 'http://172.23.254.41:3016/api/securos/event',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json) 
            };
            try{
                request(options, function(error, response) {
                    if (error) throw new Error(error);
                        if(error!=null)
                        {
                            console.log(response.body);
                            logs.Write("Error: "+response.body,"ERROR",logname);
                            logs.Write("Error: "+error,"ERROR",logname);
                        }
                        else
                        {
                            logs.Write("Response: "+response.body,"DEBUG",logname);
                        }
                }); 
            }
            catch
            {
                logs.Write("Error: There was a trouble sending event to SecurOS","ERROR",logname);
            }
            /*
            {
                "event_code": "E401", 
                "comment": "not found", 
                "event":"ALARM", 
                "type": "SENSOR", 	
                "typeID": "322545"
            }*/
        }
	}

  }
  else
  {
    console.log("///////EVENT/////////");
    var str2 = JSON.stringify(data2[1]).replace(/[\\u]/g, "");
    var data3 = str2.replace("0014", "");
    var data3 = data3.replace('"', "");
    var data3 = data3.replace('"', "");
    
    console.log("data3",data3)
    logs.Write("data3: "+data3,"DEBUG",logname);
    var receiver = data2[0];
    var panel = data3.substring(0,4);
    var clasifier = data3.substring(6,7)
    var event_code = data3.substring(7,10);
    var partition = data3.substring(10,12);
    var contact = data3.substring(12,15);
    console.log(receiver,panel,clasifier,event_code,partition,contact);
    logs.Write(receiver+"-"+panel+"-"+clasifier+"-"+event_code+"-"+partition+"-"+contact,"DEBUG",logname);
    var [event,type] = find_message(event_code);
    console.log(event,type);
            if(event==undefined)
                event="Evento no registrado";
            if(type==undefined)
                type="INFO";
  
  var event_type="";
  if(clasifier==3)
  {
    event_type = "Restore ";
    type="EVENT";
  }
  else if(clasifier==3)
    event_type = "Previous event ";

   //client.send(msg, 0, msg.length, rinfo.address);
   var buff = Buffer.from([6]);
   client.send(buff, 7700, '172.23.254.43', (err) => {
  });


   json = {
                "receiver":receiver,
                "panel": panel,
                "cid":"1234",
                "event_code":event_code,
                "comment":event_type+event,
                "event":type,
                "partition": panel+"-"+partition,
                "sensor": panel+"-"+partition+"-"+contact
            }
            console.log(json);
            logs.Write("json: "+JSON.stringify(json),"DEBUG",logname);
            var options = {
            'method': 'POST',
            'url': 'http://172.23.254.41:3016/api/securos/event',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json) //JSON.stringify({"receiver":"1","panel":"1752","cid":"18","event_code":"E401","comment":"not found","event":"ALARM","partition":"49","sensor":"1","type":"SENSOR","typeID":"1"})
            };
            try{
                request(options, function(error, response) {
                    if (error) throw new Error(error);
                        console.log(response.body);
                        logs.Write("Error: "+response.body,"ERROR",logname);
                        logs.Write("Error: "+error,"ERROR",logname);
                });
            }
            catch
            {
                logs.Write("Error: There was a trouble sending event to SecurOS","ERROR",logname);
            }
    
}    
});

client.on('listening', () => {
  const address = client.address();
  console.log(`server listening ${address.address}:${address.port}`);
  logs.Write(`server listening ${address.address}:${address.port}`,"INFO",logname);
});

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
            found = "Evento no registrado";
            type = "INFO";
        }
        
    }
    return  [found,type];
}
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