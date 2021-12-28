/* 
 *SECUROS INTEGRATION SERVER - USER ROUTES MODULE
 *@Authors: 
 *			Alejandra Aguirre  - alejandra.aguirre@issivs.com
 *			Santiago Rondon    - santiago@ivsss.com
 *			Alejandro Garcia   - alejandro@issivs.com
 *Version 1.0 
 *SecurOS 10.9
 *
*/ 
const express = require('express');
const router = express.Router();
const {isAuthenticated, isNotAuthenticated, isAdmin} = require('../helpers/auth')
const relay = require('../models/securos');
const opc = require('../models/opc');
const opcDriver = require('../drivers/opc')


////////////////////////////////////////////////////////////
////////////////////////// VISTAS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// VISTA RELAYS //////////////////////
router.get('/relays',isAuthenticated, async (req,res) => {           //ASYNC

    let Relays = await relay.find().lean().sort({name: 'ascending'});

    res.render('relays/relays',{Relays});
});

/////////////////// VISTA CREATE RELAY//////////////////////
router.get('/relays/create',isAuthenticated, async (req,res) => {           
    
    let Opc = await opc.find().lean().sort({name: 'ascending'});

    // let methodsArray = [];
    // for(let i=0; i<Opc.length; i++) {
        // methodsArray.push(Opc[i].methods);
        // console.log(Opc[i].methods)
    // }

    res.render('relays/create_relay' , {Opc});
});

/////////////////// VISTA EDIT RELAY//////////////////////
router.get('/relays/edit/:id', isAuthenticated, async (req, res) => {           
    let Opc = await opc.find().lean().sort({name: 'ascending'});
    
    const Relay = await relay.findById(req.params.id).lean();
    let serverOn = await opc.findById(Relay.actions[0].ON.server).lean();
    let serverOff = await opc.findById(Relay.actions[0].OFF.server).lean();


    res.render('relays/edit_relay', {Relay, Opc, serverOn, serverOff});
});

////////////////////////////////////////////////////////////
//////////////////////////METODOS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// METODO CREATE RELAY//////////////////////

router.post('/relays/create',isAuthenticated, async (req,res) => {     

    const {
        relay_name, 
        relay_id, 

        server_on,
        key_on,
        value_on,

        server_off,
        key_off,
        value_off} = req.body;

    const errors = []
    // console.log(req.body);

    if(!relay_name || !relay_id || !server_on || !key_on || !server_off || !key_off){
        errors.push({text:'Complete todos los campos'})
    }else if(value_on == '' || value_off == ''){
        errors.push({text:'Complete todos los campos'})
    }
    
   
    if(errors.length>0){
        let Opc = await opc.find().lean().sort({name: 'ascending'});
        res.render('relays/create_relay' , {Opc, errors});
    }

    try {
        const relay_obj = await relay.findOne({typeID: relay_id }).lean();
        
        if(relay_obj){
            errors.push({text:'Error! Ya existe un Relay con este Id'})
            let Opc = await opc.find().lean().sort({name: 'ascending'});
            res.render('relays/create_relay' , {Opc, errors});
        }else{
            //Creating the struct
            const relayObj = {
                'name': relay_name,
                'type':'GENERIC_RELAY',
                'typeID': relay_id,
                'actions':{
                    'ON':{
                        'server': server_on,
                        'key': key_on,
                        'value': value_on,
                        'state': false,
                    },
                    'OFF':{
                        'server': server_off,
                        'key': key_off,
                        'value': value_off,
                        'state': false,
                        }
                }
            }

            const Relay = new relay(relayObj)
            await Relay.save();      
            req.flash('success_msg', 'Relay creado satisfactoriamente!')
            securosDriver.add(Relay._id);
            res.redirect('/relays')
        }

    } catch (error) {
        console.log('That did not go well in relays.js /relays/create')
        console.log(error) 
    }  
});


/////////////////// METODO EDIT RELAY//////////////////////
router.put('/relay/edit/:id',isAuthenticated, async (req, res) => {           
    
    const {
        name,
        server_on,
        key_on,
        value_on,
        server_off,
        key_off,
        value_off} = req.body;
    
    const Relay = await relay.findById(req.params.id).lean();

        const relayObj = {
            'name': name,
            'type':'GENERIC_RELAY',
            'typeID': Relay.typeID,
            'actions':{
                'ON':{
                    'server': server_on,
                    'key': key_on,
                    'value': value_on,
                    'state': false,
                },
                'OFF':{
                    'server': server_off,
                    'key': key_off,
                    'value': value_off,
                    'state': false,
                    }
            }
        }

       
            await relay.findByIdAndUpdate(req.params.id, relayObj);
            req.flash('success_msg', 'Relay editado con exito!')
            res.redirect('/relays')
        
});


/////////////////// METODO DELETE RELAY//////////////////////
router.delete('/relays/delete/:id',isAuthenticated, async (req,res) => {           
    await relay.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Relay eliminado satisfactoriamente!')
    res.redirect('/relays')
});


///////////////////// API ///////////////////////////

router.post('/api/securos/ThirdPartyReact', async (req,res) => {           
   const {react,name,id,type, parent} = req.body;
   console.log(req.body)
  
   const Relay = await relay.findOne({typeID: id }).lean();

   if(react == "ON"){
       const {server, key, value} = Relay.actions[0].ON
       opcDriver.write(server, key, value);
   }

   if(react == "OFF"){
        const {server, key, value} = Relay.actions[0].OFF
       opcDriver.write(server, key, value);
   }
//    opcDriver.write(opc_id,key,value);
res.send('ok')

});

module.exports = router;
