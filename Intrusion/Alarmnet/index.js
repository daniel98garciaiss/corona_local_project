/* 
 *SECUROS INTEGRATION SERVER - INTRUSION MODULE - ALARMNET
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/
var net = require('net');
const csv = require('csvtojson');
const fs = require('fs');
var request = require('request');

var logname 				= "Alarmnet Intrusion Integration";
var logs 		= require('../../logsset/logs');

var messages;
var client = new net.Socket();
read_csv(function(){
    console.log("Message CSV successfully read");
    
    client.connect(2000, '127.0.0.1', function() {
    console.log('Connected');
    logs.Write("Client connected","INFO",logname)
    });
});


client.on('data', function(data) {
    var json;
    var data0 = data.toString().trim();
    console.log('Received: ' + data0);
    logs.Write('Received: ' + data0,"DEBUG",logname)
    if(data0=="00 OKAY @")
    {
      //ACK message
      var buff = Buffer.from([6]);
      client.write(buff);
      console.log("ACK send")
      logs.Write("ACK send","TRACE",logname);
    }
    else
    {
      var data1 = data0.split(" ");
      console.log(data1);
      logs.Write('Data1: ' + data1,"TRACE",logname)
      switch(data1.length)
      {
        case 5:
        //Ademco High Speed
            var receiver = data1[0];
            var acount = data1[1];
            var message1 = data1[2];
            var message2 = data1[3];
            var status = data1[4];
            var[event,type] = find_message(message1.toString()+message2.toString());
            console.log(event,type);
            logs.Write('Event,Type: ' + event + type,"DEBUG",logname)
            if(event==undefined)
                event="Evento no registrado";
            if(type==undefined)
                type="INFO";

            json = {
                "receiver": receiver,
                "panel": acount,
                "event_code":message1+message2,
                "comment":event,
                "event":type,
                "status":status
            };

            console.log(json);
            logs.Write('Json: ' + json,"DEBUG",logname)
            var options = {
            'method': 'POST',
            'url': 'http://127.0.0.1:3017/api/securos/event',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json) //JSON.stringify({"receiver":"1","panel":"1752","cid":"18","event_code":"E401","comment":"not found","event":"ALARM","partition":"49","sensor":"1","type":"SENSOR","typeID":"1"})

            };
            var buff = Buffer.from([6]);
            client.write(buff);
            console.log("ACK send")
            logs.Write("ACK send","TRACE",logname);
        break;
        case 6:
        //Contact ID
            var receiver = data1[0];
            var acount = data1[1];
            var cid = data1[2];
            var event_code = data1[3];
            var partition = data1[4];
            var contact = data1[5];

            var [event,type] = find_message(event_code.toString());
            console.log(event,type);
            if(event==undefined)
                event="Evento no registrado";
            if(type==undefined)
                type="INFO";
/*
{
  "event_code": "E401", 
  "comment": "not found", 
  "event":"ALARM", 
  "type": "GENERIC_USER", 	
  "typeID": "1"
}
*/
            if(contact.includes("C"))
            {
                json = {
                    "event_code": event_code, 
                    "comment": event, 
                    "event": type, 
                    "type": "GENERIC_USER", 	
                    "typeID": acount+"-"+partition+"-"+contact
                }
            }
            else if(contact.includes("U"))
            {
                json = {
                    "receiver":receiver,
                    "panel":acount,
                    "cid":cid,
                    "event_code":event_code,
                    "comment":event,
                    "event":type,
                    "partition":acount+"-"+partition,
                    "sensor":acount+"-"+partition+"-"+contact
                }
            }
            
            console.log(JSON.stringify(json));
            var options = {
            'method': 'POST',
            'url': 'http://127.0.0.1:3017/api/securos/event',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json) //JSON.stringify({"receiver":"1","panel":"1752","cid":"18","event_code":"E401","comment":"not found","event":"ALARM","partition":"49","sensor":"1","type":"SENSOR","typeID":"1"})

            };
            var buff = Buffer.from([6]);
            client.write(buff);
            console.log("ACK send")
            logs.Write("ACK send","TRACE",logname);
        break;
        default:
            console.log("default case");
            var buff = Buffer.from([21]);
            client.write(buff);
            console.log("NAK send")
            logs.Write("NAK send","TRACE",logname);
        break;
    }
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
        logs.Write("Error: There was a trouble sending events to SecurOS","ERROR",logname);
    }
    
    }  
    //client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
    logs.Write('COnnection closed: ',"INFO",logname)
});

/*read_csv(function(){
    var find=find_message("E105");
    console.log(find)
});*/

function read_csv(callback)
{
    const csvFilePath='messages.csv';
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        console.log(jsonObj);
        logs.Write(jsonObj,"TRACE",logname)
        messages=JSON.parse(JSON.stringify(jsonObj));
        callback(messages);
    })
}
function find_message(message_to_find)
{
    console.log("finding: "+message_to_find +"...")
    logs.Write("finding: "+message_to_find +"...","TRACE",logname)
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

function process_data(data)
{
       var data0 = "29 Jul 2021-10:33:14-01/C1-SG -01-000-0000-NVZ0100-TCP/IP 1 Printer Failed";
    console.log('Received: ' + data0);
  try
  {
    var pattern = /((\w|\s)*)-*?/ig;
    var data0 = data0.match( pattern );
    console.log("length: "+data0.length,"data 0: "+data0);
    var date = new Date(data0[0]+" "+data0[2]+":"+data0[4]+":"+data0[6]);
    var receptor = data0[14];
    var line = data0[16];
    var panel = data0[18];
    var message = data0[20];
    var complement = data0[22];
    console.log(date,receptor,line,panel,message,complement);
    var alarm=find_message(message);
    console.log(alarm)
  } 
  catch(e)
  {
    console.log(e);
    logs.Write("Error: "+e,"ERROR",logname);
  }
}

var status = ["Diagnostic",
"Notification",
"N/A",
"N/A",
"N/A",
"Suscriber trouble",
"Status",
"Alarm",
"Alarm with low battery",
"Test"
];