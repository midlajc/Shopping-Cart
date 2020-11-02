const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectID, ObjectId } = require("mongodb");
const { response } = require("../app");
const { resolve, reject } = require("promise");
var userHelper = require("../helpers/user-helpers");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let accountStatus = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
      if (accountStatus) {
        reject({ message: "Account Already", accountStatus: true })
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data.ops[0]);
          });
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("filed");
            resolve({ passwordStatus: true, message: "Password incorrect" });
          }
        });
      } else {

        resolve({ accountStatus: true, message: "User not Found" });
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: ObjectID(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({
            user: ObjectId(userId), 'products.item': ObjectId(proId)
          }, {
            $inc: { 'products.$.quantity': 1 }
          }).then((response) => {
            resolve()
          })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectID(userId) }, {
            $push: { products: proObj }
          }).then((response) => {
            resolve()
          })
        }
      } else {
        let cartObj = {
          user: ObjectID(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve()
        })
      }
    })
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray()
      resolve(cartItems)
    })
  },
  getCartCount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let cartCount = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            quantity: 1//, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            cartCount: { $sum: '$quantity' }
          }
        }
      ]).toArray()
      resolve(cartCount[0].cartCount)
    })
  },
  changeProductQuandity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
      if (details.count === -1 && details.quantity === 1) {
        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectID(details.cart) },
          {
            $pull: { products: { item: ObjectId(details.product) } }
          }).then(() => {
            resolve({ removeProduct: true })
          })
      } else {
        db.get().collection(collection.CART_COLLECTION).updateOne({
          _id: ObjectId(details.cart), 'products.item': ObjectId(details.product)
        }, {
          $inc: { 'products.$.quantity': details.count }
        }).then((response) => {
          resolve({ status: true })
        })
      }
    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
          }
        }
      ]).toArray()
      resolve(total[0].total)
    })
  },
  getProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) })
      resolve(cart.products)
    })
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
      let orderObj = {
        address: {
          mobile: order['contact-number'],
          landmark: order.address,
          pincode: order.pincode
        },
        userId: ObjectID(order.userId),
        paymentMethod: order['payment-method'],
        products: products,
        totalAmount: total,
        date: new Date(),
        status: status
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        //db.get().collection(collection.CART_COLLECTION).removeOne({user:ObjectID(order.address)})
        resolve()
      })
    })
  },
  getUserOrders: (userId) => {
    return new Promise(async(resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray()
      resolve(orders)
    })
  }
};
