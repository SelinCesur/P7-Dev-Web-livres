const express = require('express');
const bodyParser = require('body-parser'); // package qui permet de transformer le corps de la requête en objet JSON utilisable
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

mongoose
  .connect(
    'mongodb+srv://cakmakciselin:DbwEkEh6w7PNv9uO@cluster0.6lvizpt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// app.use permet d'attribuer un middleware à notre application
const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});
// Permet de décalrer le dossier images de manières statique, ce dossier contiendra des images et qu'on pourra y accéder de manière directe
app.use('/images', express.static(path.join(__dirname, 'images')));

// La liste des routes à utiliser
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

module.exports = app;
