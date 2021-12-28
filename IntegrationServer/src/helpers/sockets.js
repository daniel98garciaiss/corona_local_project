const Opc = require('../models/opc')
var intervalRealTime = null;

const {querySecuros} = require('../public/js/pg');

module.exports = 
    function (io){
        let users = {}
        io.on('connection', socket =>{
            console.log("New User Connected")


            socket.on("monitorOpc", id => {
                clearInterval(intervalRealTime);

                // console.log("opc id_______________"+id);
                intervalRealTime = setInterval(async ()=>{
                    try {
                        let opc = await Opc.findOne({"_id": id});
                        // console.log(opc);

                        if(opc.methods){
                            let methods = opc.methods[0];
                            socket.emit("renderVariables",{methods});
                        }
                        
                    } catch (error) {
                        console.log(error)
                    }
                  
                }, 300)
            })


            socket.on("updatePriority", async (id, priority) => {
                console.log(id, priority)
                try {
                  
                    await querySecuros(`UPDATE "OBJ_SENSOR" SET tp_name = '${priority}' WHERE id = '${id}'`);
                    console.log("priority updated");    
                    socket.emit("succesMessage");
                } catch (error) {
                    console.log(error)

                }
            })

            socket.on("sensorsSearch", async (value) => {
                // console.log(value)
                try {
                    let result = await querySecuros(`SELECT * FROM "OBJ_SENSOR"
                                                     WHERE id LIKE '${value}%'
                                                     ORDER BY id ASC`);
                    console.log(result);    
                    console.log("sensor searched");    
                    socket.emit("renderSensors", result);
                } catch (error) {
                    console.log(error)

                }
            })

        })


        
    }