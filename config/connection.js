const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}


module.exports.connect=(done)=>{
    // const url='mongodb+srv://midlajc:password@123@shoppingcart.avtrc.mongodb.net/shoppingcart?retryWrites=true&w=majority'
    const url='mongodb://localhost:27017'
    const dbname='shoppingcart'

    mongoClient.connect(url,{ useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=()=>{
    return state.db
}