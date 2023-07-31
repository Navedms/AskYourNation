import express from 'express';
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

  router.get('/', (req, res) => {
    res.send({ title: 'Books' });
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
