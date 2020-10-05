const db=require('../config/connection')
const collection=require('../config/collections')


module.exports={
    addProduct:(product)=>{
        return new Promise((resolve,reject)=>{
            console.log(product)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            resolve(data.ops[0]._id)
        })
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}