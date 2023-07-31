import dotenv from 'dotenv';

interface Config {
  mongo: {
    url: string;
  };
  server: {
    port: string | number;
  };
}

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const SERVER_PORT = process.env.SERVER_PORT || 1337;

export const config: Config = {
  mongo: {
    url: MONGO_URL || '',
  },
  server: {
    port: SERVER_PORT,
  },
};
