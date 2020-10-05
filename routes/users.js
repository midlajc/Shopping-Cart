var express = require('express');
var router = express.Router();
var productHelper = require("../helpers/product-helpers");  
var userHelper = require("../helpers/user-helpers");  

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  productHelper.getAllProduct().then((products) => {
    res.render("user/view-products", { products,user });
  });
});

router.get('/login',(req,res)=>{
  let accountStatus=req.session.accountStatus
  passwordStatus=req.session.passwordStatus
  let message=req.session.message
  res.render('user/login',{message,accountStatus,passwordStatus})
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.passwordStatus=response.passwordStatus
      req.session.accountStatus=response.accountStatus
      req.session.message=response.message
      res.redirect('/login')
    }
  })
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((res)=>{
    console.log(res);
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()

  res.redirect('/')
})
module.exports = router;
