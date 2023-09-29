const User = require("../models/User");
const { validationResult } = require("express-validator");
const nanoid = import("nanoid");
const nodemailer = require("nodemailer");

// para poder acceder a las varibles de entorno
require("dotenv").config();

const registerForm = (req, res) => {
  res.render("register");
};

const registerUser = async (req, res) => {
  // valida los campos
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password, repassword } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) throw new Error("Ya existe el usuario");

    const tokenConfirm = (await nanoid).nanoid(7);

    user = new User({ userName, email, password, tokenConfirm });
    await user.save();

    // enviar correo electronico con la confirmacion de la cuenta
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.userEmail,
        pass: process.env.passEmail
      }
    });

    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verifica tu cuenta de correo", // Subject line
      html: `<a href="http://localhost:3000/auth/confirmar/${user.tokenConfirm}">Verificar usuario aqui</a>`
    });

    req.flash("mensajes", [
      { msg: "Revisa tu correo electrónico y valida la cuenta" },
    ]);

    return res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe este usuario");
    user.cuentaConfirmada = true;
    user.tokenConfirm = null;

    await user.save();

    req.flash("mensajes", [
      { msg: "Cuenta verificada, puedes iniciar sesión" },
    ]);

    return res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const loginUser = async (req, res) => {
  // valida los campos
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) throw new Error("El email no existe");
    if (!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");
    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña incorrecta");

    req.login(user, function (err) {
      if (err) throw new Error("Error al crear la sesión");
      return res.redirect("/");
    });

  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const loginForm = (req, res) => {
  res.render("login");
};

const cerrarSesion = (req, res, next)=>{
  req.logout((err)=>{
    if (err) return next(err);
    res.redirect('/auth/login');
  });
}

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion
};
