var express = require('express');
var router = express.Router();
var productHelper = require("../helpers/product-helpers");  
var userHelper = require("../helpers/user-helpers");  

const verifyLogin=((req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
})  

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  productHelper.getAllProduct().then((products) => {
    res.render("user/view-products", { products,user });
  });
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    console.log("hello");
    res.redirect('/')
}else{
  let accountStatus=req.session.accountStatus
  let passwordStatus=req.session.passwordStatus
  let message=req.session.message
  res.render('user/login',{message,accountStatus,passwordStatus})
}
})
router.post('/login',(req,res)=>{
  
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
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
  userHelper.doSignup(req.body).then((response)=>{
    console.log(res);
    res.redirect('/login')
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()

  res.redirect('/')
})

router.get('/cart',verifyLogin,(req,res)=>{
  let user=req.session.user
  res.render('user/cart',{user})
})

module.exports = router;
