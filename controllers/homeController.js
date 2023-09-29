// model
const Url = require("../models/Url");
const nanoid = import("nanoid");

const leerUrls = async (req, res)=>{

  // "req.user" existe en todas las rutas que tengan el validator verificarUser

  try {

    // solo se muentras las url del usuario de la session
    const urls = await Url.find({user: req.user.id}).lean();
    res.render("home", { urls: urls })
    
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }

}

const agregarUrl = async (req, res)=>{

  const { origin } = req.body;

  const shortURL = (await nanoid).nanoid(7);

  try {

    const url = new Url({ origin: origin, shortURL: shortURL, user: req.user.id});
    await url.save();

    req.flash("mensajes", [{ msg: "URL agregada" }]);
    res.redirect('/');

  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }

}

const eliminarUrl = async (req, res)=>{

  const {id} = req.params;
  
  try {

    const url = await Url.findById(id);
    
    // se comprueba si la url pertenece al usuario
    if(!url.user.equals(req.user.id)){
      throw new Error("La URL no te pertenece");
    }

    // la elimina
    await url.deleteOne()

    req.flash("mensajes", [{ msg: "URL eliminada" }]);

    res.redirect('/');
    
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
}

const editarUrlForm = async (req, res)=>{
  
  const {id} = req.params;

  try {

    const url = await Url.findById(id).lean();

    // se comprueba si la url pertenece al usuario
    if(!url.user.equals(req.user.id)){
      throw new Error("La URL no te pertenece");
    }

    res.render("home", { url });
    
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
  
}

const editarUrl = async (req, res)=>{
  
  const { id } = req.params;
  const { origin } = req.body;

  try {

    const url = await Url.findById(id);
    
    // se comprueba si la url pertenece al usuario
    if(!url.user.equals(req.user.id)){
      throw new Error("La URL no te pertenece");
    }

    // la actualiza
    await url.updateOne({origin});
    req.flash("mensajes", [{ msg: "URL editada" }]);

    res.redirect("/");
    
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/");
  }
  
}

const redireccionamiento = async (req, res)=>{
  
  const { shortURL } = req.params;

  try {

    if(shortURL !== "favicon.ico"){

      const urlDB = await Url.findOne({shortURL: shortURL});

      res.redirect(urlDB.origin);

    }
    
  } catch (error) {
    req.flash("mensajes", [{ msg: "No existe esta URL configurada"}]);
    return res.redirect("/auth/login");
  }
  
}

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento
};