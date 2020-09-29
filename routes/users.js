var express = require('express');
var router = express.Router();
var productHelper = require("../helpers/product-helpers");  

/* GET home page. */
router.get('/', function(req, res, next) {
  
  productHelper.getAllProduct().then((products) => {
    res.render("users/view-products", { products, admin: false });
  });
});

module.exports = router;
