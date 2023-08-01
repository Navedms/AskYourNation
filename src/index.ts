import express from 'express';
import mongoose from 'mongoose';

import { config } from './config/config';
// import authorRoutes from "./routes/Author";
// import bookRoutes from "./routes/Book";

const router = express();

// conect to mongoDB

mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    console.log('connected to database');
    startServer();
  })
  .catch((error) => {
    console.log('unable to connect to database');
    console.log(error);
  });

// start the server if mongo connected

const startServer = () => {
  router.use((req, res, next) => {
    // log the Request
    console.log(
      `Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      console.log(
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
    console.log(error);

    return res.status(404).json({ message: error.message });
  });

  router.listen(config.server.port, () =>
    console.log(`Server listening on port ${config.server.port}`)
  );
};
// api address:  https://naughty-newt-necklace.cyclic.cloud
