var express = require("express");
const { render, response } = require("../app");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var adminHelper=require('../helpers/admin-helpers')

const verifyAdminLogin = ((req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
})

/* GET admin listing. */
router.get("/",verifyAdminLogin, function (req, res) {
  productHelper.getAllProduct().then((products) => {
    admin=req.session.admin
    adminLoggedIn=req.session.adminLoggedIn
    res.render("admin/view-products", { products, admin: true,admin,adminLoggedIn });
  });
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product", {admin: true });
});

router.post("/add-product", function (req, res) {
  productHelper.addProduct(req.body).then((id) => {
    let image = req.files.image;
    image.mv("./public/images/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else console.log(err);
    });
  });
});

router.get('/delete-product/:id',(req,res)=>{
  proId=req.params.id
  productHelper.deleteProduct(proId).then(()=>{
    res.redirect('/admin')
  })
})

router.get('/edit-product/:id',(req,res)=>{
  proId=req.params.id
  productHelper.getProductDetails(proId).then((product)=>{
    console.log('hello');
    res.render('admin/edit-product',{product,admin: true})
  })  
})
router.post('/edit-product/:id',(req,res)=>{
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    if(req.files.image){
      let image=req.files.image
      image.mv("./public/images/product-images/" + req.params.id + ".jpg")
    }
    res.redirect('/admin')
  })
})

router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/')
  } else {
    let accountStatus = req.session.accountStatus
    let passwordStatus = req.session.passwordStatus
    let message = req.session.message
    res.render('admin/login', { message, accountStatus, passwordStatus ,admin:true})
  }
})

router.post('/login',(req, res) => {

  adminHelper.doAdminLogin(req.body).then((response) => {

    if (response.status) {

      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    } else {
      req.session.passwordStatus = response.passwordStatus
      req.session.accountStatus = response.accountStatus
      req.session.message = response.message
      res.redirect('/admin/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin')
})
module.exports = router;
