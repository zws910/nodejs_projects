var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: '用户登陆' });
    // res.send('bingo.');
});

/* POST login */
router.post('/', function(req, res, next) {
    var user = {
        username: 'admin',
        password: 'admin'
    };
    if (req.body.username===user.username && req.body.password===user.password) {
        res.redirect('/');        
    };
    res.redirect('/');
});



module.exports = router;