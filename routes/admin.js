var express = require("express");
const { render } = require("../app");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProduct().then((products) => {
    res.render("admin/view-products", { products, admin: true });
  });
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product", { title: "Express", admin: true });
});

router.post("/add-product", function (req, res) {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv("./public/images/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product", { admin: true });
      } else console.log(err);
    });
  });
});

module.exports = router;
