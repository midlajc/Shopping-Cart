var express = require("express");
const { render, response } = require("../app");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res) {
  productHelper.getAllProduct().then((products) => {
    res.render("admin/view-products", { products, admin: true });
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

module.exports = router;
