var express = require('express');
const { response } = require('../app');
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");

const verifyLogin = ((req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
})

const getCartCount = (async (user) => {
  let cartCount
  if (user) {
    cartCount = await userHelper.getCartCount(user._id)
    return cartCount
  }
})

/* GET home page. */
router.get('/', async (req, res) => {
  let user = req.session.user
  let cartCount = await getCartCount(user)
  productHelper.getAllProduct().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    let accountStatus = req.session.accountStatus
    let passwordStatus = req.session.passwordStatus
    let message = req.session.message
    res.render('user/login', { message, accountStatus, passwordStatus })
  }
})
router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {

    if (response.status) {

      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.passwordStatus = response.passwordStatus
      req.session.accountStatus = response.accountStatus
      req.session.message = response.message
      res.redirect('/login')
    }
  })
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response)
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  }).catch((response) => {
    accountStatus = response.accountStatus
    message = response.message
    res.render('user/signup', { message, accountStatus })
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  let user = req.session.user
  let cartCount = await getCartCount(user)
  userHelper.getCartProducts(user._id).then((products) => {
    console.log(products);
    res.render('user/cart', { user, products, cartCount, total })
  })
})

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {

    res.json({ status: true })
  })
})

router.post('/change-product-quandity', (req, res, next) => {
  userHelper.changeProductQuandity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/check-out', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  user = req.session.user
  let cartCount = await getCartCount(user)
  res.render('user/check-out', { user, cartCount, total })
})

router.post('/place-order', async (req, res) => {
  let products = await userHelper.getProductList(req.body.userId)
  let total = await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, total).then((response) => {
    res.json({status:true})
  })
})

router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',verifyLogin,async(req,res)=>{
  user=req.session.user
  let orders=await userHelper.getUserOrders(user._id)
  console.log(orders);
  res.render('user/orders',{user,orders})
})

module.exports = router;
