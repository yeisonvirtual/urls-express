const express = require("express");
const path = require("path");
// motor de plantillas
const { create } = require("express-handlebars");
// manejo de sesiones
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const csrf = require("csurf");

const User = require("./models/User");

// variables de entorno
require("dotenv").config();
// configuracion db
require("./database/db");

const app = express();

//console.log(process.env.SESSIONSECRET);

app.use(
  session({
    secret: "gato",
    resave: false,
    saveUninitialized: false,
    name: "secret-name",
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
