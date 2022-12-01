const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
    //res.send('Hola mundo');
    res.redirect('/links/add')
});

module.exports = router;