const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('..')
const objectId = require('mongodb').ObjectID



module.exports = {
    addProduct: (product) => {
        return new Promise((resolve, reject) => {
            console.log(product)
            product.price = parseInt(product.price)
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data.ops[0]._id)
            })
        })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateProduct: (proId, data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    category: data.catagory
                }
            }).then(() => {
                resolve()
            })
        })
    }
} 