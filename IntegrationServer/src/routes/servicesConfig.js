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
// const securosDriver = require('../drivers/securos');
const {isAuthenticated, isNotAuthenticated, isAdmin} = require('../helpers/auth')
// const relay = require('../models/securos');
const opc = require('../models/opc');
const Service = require('../models/service');


////////////////////////////////////////////////////////////
////////////////////////// VISTAS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// VISTA CONFIGURACION AVANZADA //////////////////////
router.get('/advance-config',isAuthenticated, async (req,res) => {           
    const services = await Service.find().lean();

    res.render('config-services/advance_config',{services})
});

router.get('/advance-config/service/:id',isAuthenticated, async (req,res) => {           //ASYNC
    const _id =req.params.id;
    const service = await Service.findOne({_id}).lean();
    res.render('config-services/opc', {service});
});

/////////////////// VISTA CREATE //////////////////////


/////////////////// VISTA EDIT //////////////////////
router.get('/advance-config/edit/service/:id', isAuthenticated, async (req, res) => {           
    
    const service = await Service.findById(req.params.id).lean();
    res.render('relays/edit_relay', {Relay});
});

////////////////////////////////////////////////////////////
//////////////////////////METODOS ///////////////////////////
////////////////////////////////////////////////////////////

/////////////////// PUT - EDITAR OPC //////////////////////
router.put('/advance-config/edit/service/:id',isAuthenticated, async (req,res) =>{
    let {ip,port} = req.body;
        const service = await Service.findById(req.params.id).lean();

        await Service.findByIdAndUpdate(req.params.id,{ip,port});
        req.flash('success_msg', `Servicio ${service.name} editado con exito!`)
        res.redirect('/advance-config')
});
 
module.exports = router;
