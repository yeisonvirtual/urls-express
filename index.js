const express = require("express");
const path = require("path");

// motor de plantillas
const { create } = require("express-handlebars");

// manejo de sesiones
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");

// para seguridad
// formularios
const csrf = require("csurf");
// query selectors
const mongoSanitize = require('express-mongo-sanitize');
// para utilizar varios servidores
var cors = require('cors');

const User = require("./models/User");

// variables de entorno
require("dotenv").config();
// configuracion db
const clientDB = require("./database/db");

const app = express();

const corsOptions = {
  credentials: true,
  origin: process.env.PATHURL || "*",
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "session-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME
    }),
    
    cookie: { secure: process.env.MODO === "production", // si es production puede ser "true"
    maxAge: 30 * 24 * 60 * 60 * 1000 } // solo para produccion

  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done)=> {
  //console.log(user);
  return done(null, {id: user._id, userName: user.userName})
});

passport.deserializeUser(async (user, done)=>{
  //console.log(user.id);
  const userDB = await User.findOne({_id: user.id});
  //console.log(userDB);
  return done(null, { id: userDB._id, userName: userDB.userName });
});

// configuracion motor de plantillas
const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// para seguridad en formularios
app.use(csrf());
// para seguridad en query selectors
app.use(mongoSanitize());

app.use((req, res, next)=>{
  // variables que se envian a las vistas
  res.locals.csrfToken = req.csrfToken();
  // para los mensajes de error
  res.locals.mensajes = req.flash("mensajes");
  next();
});

// route
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`servidor on port ${PORT}`));
