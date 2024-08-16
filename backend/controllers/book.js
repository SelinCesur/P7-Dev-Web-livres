const Book = require('../models/book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  // On supprime l'id et l'userId envoyés par le client
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: 'Book created!' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Rating

exports.getBestRating = (req, res, next) => {
  Book.find()
    .then((books) => {
      const bestRating = books.sort(
        (a, b) => b.averageRating - a.averageRating
      );
      res.status(200).json(bestRating);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const bookId = req.params.id;
  const rating = JSON.parse(req.body.rating);

  console.log(rating);

  // On lui donne l'user id de l'utilisateur authentifié
  const rate = {
    userId: req.auth.userId,
    grade: rating,
  };

  Book.findOne({ _id: bookId })
    .then((book) => {
      // console.log(book);

      // On vérifie si l'utilisateur a déjà noté le livre
      const noteQuiExiste = book.ratings.filter(
        (rating) => rating.userId === rate.userId
      );

      // Si l'utilisateur a déjà noté le livre, on met à jour sa note
      if (noteQuiExiste.length > 0) {
        const index = book.ratings.findIndex(
          (rating) => rating.userId === rate.userId
        );
        book.ratings[index].grade = rate.grade;
      } else {
        // Sinon, on ajoute sa nouvelle note
        book.ratings.push(rate);
      }
      console.log(book);

      // On calcule la nouvelle note moyenne
      let sum = 0;
      book.ratings.forEach((rating) => {
        sum += rating.grade;
      });
      book.averageRating = sum / book.ratings.length;

      // On sauvegarde le livre et on renvoie le livre mis à jour
      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
