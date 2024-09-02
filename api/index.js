require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const User = require('./models/User');
const Place = require('./models/Place');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'secret';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
  res.json('Hello World');
});

// Register route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({ name, email, password: bcrypt.hashSync(password, bcryptSalt) });
    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (error, token) => {
        if (error) throw error;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

// Profile route
app.get('/profile', async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, cookieData) => {
      if (error) throw error;

      const { name, email, _id } = await User.findById(cookieData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

// Logout route
app.post('/logout', (req, res) => {
  res.cookie('token', '').json('logged out');
});

// Upload by link route
app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = 'photo' + Date.now() + '.jpg';

  await imageDownloader.image({
    url: link,
    dest: __dirname + '/uploads/' + newName,
  });

  res.json(newName);
});

// Upload from local device route
const photosMiddleware = multer({ dest: 'uploads/' });
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];
  for (const file of req.files) {
    const { path, originalname } = file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads\\', ''));
  }
  res.json(uploadedFiles);
});

// Create new place route
app.post('/places', async (req, res) => {
  const { token } = req.cookies;
  const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
  jwt.verify(token, jwtSecret, {}, async (error, cookieData) => {
    if (error) throw error;
    const placeDoc = await Place.create({
      owner: cookieData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  });
});

// Get all places for a user route
app.get('/user-places', async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (error, cookieData) => {
    if (error) throw error;
    const { id } = cookieData;
    res.json(await Place.find({ owner: id }));
  });
});

// Get single place route
app.get('/places/:id', async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
});

// Update place route
app.put('/places', async (req, res) => {
  const { token } = req.cookies;
  const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
  jwt.verify(token, jwtSecret, {}, async (error, cookieData) => {
    if (error) throw error;

    const placeDoc = await Place.findById(id);
    if (cookieData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

// Get all places route
app.get('/places', async (req, res) => {
  res.json(await Place.find());
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
