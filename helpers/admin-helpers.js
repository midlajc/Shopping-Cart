const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const objectId = require('mongodb').ObjectID
const bcrypt = require("bcrypt");

module.exports = {
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
          let loginStatus = false;
          let response = {};
          let admin = await db
            .get()
            .collection(collection.ADMIN_COLLECTION)
            .findOne({ email: adminData.email });
          if (admin) {
            bcrypt.compare(adminData.password, admin.password).then((status) => {
              if (status) {
                response.admin = admin;
                response.status = true;
                resolve(response);
              } else {
                resolve({ passwordStatus: true, message: "Password incorrect" });
              }
            });
          } else {
    
            resolve({ accountStatus: true, message: "User not Found" });
          }
        });
      }
}