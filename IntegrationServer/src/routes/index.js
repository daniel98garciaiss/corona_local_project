const express = require('express');
const { connect } = require('mongoose');
const router = express.Router();
const user = require('../models/user')
const passport = require('passport')
const path = require('path');

const {isAuthenticated} = require('../helpers/auth')

router.get('/', async (req,res) => {
    let users = await user.find().lean().sort({login: 'asc'});
    if(users.length===0)
    res.render('index');
    else
    res.redirect('/login');

});

router.get('/firsttime', async (req,res) => {
    let users = await user.find().lean().sort({login: 'asc'});
    if(users.length>0)
    res.redirect('/');
    else
    res.render('firsttime');

});

router.get('/test', async (req,res) => {
   
    res.sendFile(path.join(__dirname, 'IFRAME_MONITOR.html'));

});
router.get('/user/signin', (req,res) => {
    res.send('Ingresando a la app');
});

router.get('/user/signup', (req,res) => {
    res.send('Logging');
});






module.exports = router;


