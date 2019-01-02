var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  Post.get(null, function(err, posts){
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: 'Home Page',
      posts: posts,
    });
  });
});

/* POST new posts */
router.post('/post', checkLogin);
router.post('/post', function(req, res, next){
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.post);
  post.save(function(err){
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'Post success');
    res.redirect('/u/'+currentUser.name);
  });
});

/* GET user page */
router.get('/u/:user', function(req, res){
  User.get(req.params.user, function(err, user){
    if (!user) {
      req.flash('error', '用户不存在');
      res.redirect('/');
    }
    Post.get(user.name, function(err, posts){
      if (err) {
        req.flash('/');
        return res.redirect('error', err);
      }
      res.render('user', {
        title: user.name,
        posts: posts
      });
    });
  });
});

/* GET register page. */
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
  res.render('reg', { title: 'Register' });
});

/* GET login page. */
router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Sign in' });
});

/* POST login page */
router.post('/login', checkNotLogin);
router.post('/login', function(req, res, next){
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function(err, user){
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登入成功');
    return res.redirect('/');
  });
});

/* GET logout page */
router.get('/logout', checkLogin);
router.get('/logout', function(req, res, next){
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
})

/* POST register */
router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res, next){
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  console.log(password);
  var newUser = new User({
    name: req.body.username,
    password: password
  });
  User.get(newUser.name, function(err, user){
    if (err) {
      // 错误, 跳转到reg
      req.flash('error', err);
      return res.redirect('/reg');
    }
    // 判断用户是否存在
    if (user) {
      // 用户存在, 跳转到reg
      req.flash('error','user existed');
      return res.redirect('/reg');
    }
    // 判断密码是否一致
    if (req.body.password !== req.body['password-repeat']){
      // 密码不一致
      req.flash('error','password not equal');
      return res.redirect('/reg');
    }
    // 用户不存在
    newUser.save(function(err){
      if (err) {
        req.flash('error','save failure');
        return res.redirect('/reg');
      }
      // 注册成功, 跳转到/
      req.flash('success','save success');
      res.redirect('/');
    });
  });
});

function checkLogin(req, res, next){
  if (!req.session.user) {
    req.flash('error', '用户未登陆');
    return res.redirect('/login');
  }
  next();
};

function checkNotLogin(req, res, next){
  if (req.session.user) {
    req.flash('error', '用户已登陆');
    return res.redirect('/');
  }
  next();
};


module.exports = router;
