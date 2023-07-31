import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

import { config } from './config/config';
import Logging from './library/Logging';
// import authorRoutes from "./routes/Author";
// import bookRoutes from "./routes/Book";

const router = express();

// conect to mongoDB

mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    Logging.info('connected to database');
    startServer();
  })
  .catch((error) => {
    Logging.error('unable to connect to database');
    Logging.error(error);
  });

// start the server if mongo connected

const startServer = () => {
  router.use((req, res, next) => {
    // log the Request
    Logging.info(
      `Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      Logging.info(
        `Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });

    next();
  });
  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());

  // Rules of our APIs

  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH'
      );
      return res.status(200).json({});
    }
    next();
  });

  // Routes
  // router.use('/nations', nationRoutes);
  // router.use('/users', userRoutes);
  // router.use('/questions', questionRoutes);

  // Error handling
  router.use((req, res, next) => {
    const error = new Error('Not Found');
    Logging.error(error);

    return res.status(404).json({ message: error.message });
  });

  router.listen(config.server.port, () =>
    Logging.info(`Server listening on port ${config.server.port}`)
  );
};

// api address:  https://naughty-newt-necklace.cyclic.cloud
