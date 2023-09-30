// getting-started.js
const mongoose = require('mongoose');
// para porder acceder las variables de entorno
require("dotenv").config();

//const localBDD = `mongodb://127.0.0.1:27017/${process.env.DBNAME}`;
//const atlasBDD = process.env.URI

const clientDB = mongoose
  .connect(`mongodb://127.0.0.1:27017/${process.env.DBNAME}`)
  .then((m)=> {
    console.log("db conectada");
    return m.connection.getClient();
  })
  .catch((e)=> console.log("fallo la conexion " + e));

module.exports = clientDB;
