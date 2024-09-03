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
const Booking = require('./models/Booking');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'secret';
const bucket = 'ian-booking-app';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

async function uploadToS3(path, originalFilename, mimetype) {
  const client = new S3Client({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  const parts = originalFilename.split('.');
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + '.' + ext;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: 'public-read',
    })
  );
  return `https://${bucket}.s3-ap-southeast-2.amazonaws.com/${newFilename}`;
}

// Register route
app.post('/register', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
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
  mongoose.connect(process.env.MONGO_URL);
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
  mongoose.connect(process.env.MONGO_URL);
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
    dest: '/tmp/' + newName,
  });

  const url = await uploadToS3('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName));

  res.json(url);
});

// Upload from local device route
const photosMiddleware = multer({ dest: '/tmp' });
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname, mimetype } = req.files[i];
    const url = await uploadToS3(path, originalname, mimetype);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
});

// Create new place route
app.post('/places', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
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
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (error, cookieData) => {
    if (error) throw error;
    const { id } = cookieData;
    res.json(await Place.find({ owner: id }));
  });
});

// Get single place route
app.get('/places/:id', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  res.json(await Place.findById(id));
});

// Update place route
app.put('/places', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
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
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find());
});

// Handle booking
app.post('/bookings', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const cookieData = await getUserDataFromReq(req);

  const { place, checkIn, checkOut, numberOfGuest, name, phone, price } = req.body;
  const doc = await Booking.create({
    user: cookieData.id,
    place,
    checkIn,
    checkOut,
    numberOfGuest,
    name,
    phone,
    price,
  });
  res.json(doc);
});

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (error, cookieData) => {
      if (error) reject(error);

      resolve(cookieData);
    });
  });
}

// Get all bookings for a user route
app.get('/bookings', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const cookieData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: cookieData.id }).populate('place'));
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
