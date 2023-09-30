const formidable = require("formidable");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

module.exports.formPerfil = async (req, res) => {

	try {

		const user = await User.findById(req.user.id);
		return res.render("perfil", {user: req.user, imagen: user.imagen})

	} catch (error) {

		req.flash("mensajes", [{ msg: "Error al leer el usuario" }]);
		return res.redirect("/perfil");

	}

};

module.exports.editarFotoPerfil = async (req, res) => {
  
	const form = new formidable.IncomingForm();
	form.maxFileSize = 50 * 1024 * 1024; // 50mb

	form.parse(req, async (err, fields, files) => {

		try {

			if (err) {
				throw new Error("Fallo subida de imagen");
			}

			// se extrae la imagen
			const file = files.myFile;

			// se hacen las validaciones
			if (file.originalFilename === "") {
				throw new Error("No se subió ninguna imagen");
			}

			const imageTypes = [
				"image/jpg",
				"image/jpeg",
				"image/png",
				"image/webp",
				"image/gif",
			];

			if (!imageTypes.includes(file[0].mimetype)) {
				throw new Error("Por favor agrega una imagen con un formato válido");
			}

			if (file.size > 50 * 1024 * 1024){
				throw new Error("Debe ser menos de 50MB");
			}

			// se obtiene la extension de la img
			const extension = file[0].mimetype.split("/")[1];
			// ruta donde se guadará la img
			const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);

			// la ruta anterio y la nuevo ruta de la img
			fs.renameSync(file[0].filepath, dirFile);

			// se redimensiona la imagen
			const image = await Jimp.read(dirFile);
			image.resize(200, 200).quality(90).writeAsync(dirFile);

			// se le asigna el nombre la imagen de perfin en la BDD
			const user = await User.findById(req.user.id);
			user.imagen = `${req.user.id}.${extension}`;
			await user.save();

			req.flash("mensajes", [{ msg: "Ya se subió la imagen" }]);

		} catch (error) {
			
			req.flash("mensajes", [{ msg: error.message }]);
    	
		} finally {

			return res.redirect("/perfil");
		}

	});

};
