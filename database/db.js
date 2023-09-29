// getting-started.js
const mongoose = require('mongoose');

//const localBDD = "mongodb://127.0.0.1:27017/dbUrlTwitch";
//const atlasBDD = process.env.URI

mongoose
  .connect("mongodb://127.0.0.1:27017/dbUrlTwitch")
  .then(()=> console.log("db conectada"))
  .catch((e)=> console.log("fallo la conexion " + e));