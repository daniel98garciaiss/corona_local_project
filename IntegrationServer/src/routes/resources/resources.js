const express = require('express');
const { connect } = require('mongoose');
const router = express.Router();
const passport = require('passport')

//resources Models
const user = require('../../models/user')
const restapi = require('../../models/restapi')
const opc = require('../../models/opc')


const {isAuthenticated, isAdmin} = require('../../helpers/auth')


/////////////////// VISTA RELAYS //////////////////////
router.get('/resources/create',isAuthenticated, async (req,res) => {           //ASYNC


    res.render('resources_to_create');
});

router.get('/resources',isAuthenticated, async (req,res) => {           //ASYNC
    let Opc = await opc.find().lean().sort({name: 'ascending'});
    let Restapi = await restapi.find().lean().sort({name: 'ascending'});
    res.render('resources',{Opc,Restapi})
    
});

module.exports = router;