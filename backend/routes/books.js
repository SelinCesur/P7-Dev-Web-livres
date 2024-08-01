const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');

// Middleware d'authentification
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// GET / (route pour afficher tous les livres sans authentification)
router.get('/', bookCtrl.getAllBooks);

// GET /bestrating (route pour afficher les livres les mieux notés sans authentification)
// Cette méthode doit être placée avant la route /:id pour éviter les confusions
router.get('/bestrating', bookCtrl.getAllBooks);

// GET /:id (route pour afficher un livre spécifique sans authentification)
router.get('/:id', bookCtrl.getOneBook);

// POST
router.post('/', auth, multer, bookCtrl.createBook);

// PUT /:id
router.put('/:id', auth, multer, bookCtrl.modifyBook);

// DELETE /:id
router.delete('/:id', auth, bookCtrl.deleteBook);

// POST /:id/rating
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
