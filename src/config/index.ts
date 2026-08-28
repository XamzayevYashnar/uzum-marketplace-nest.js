import { config } from 'dotenv';
config();

export const env = {
  PORT: Number(process.env.PORT),
  DB_URI: String(process.env.DB_URI),
  SUPERADMIN: {
    email: String(process.env.SUPERADMIN_EMAIL),
    password: String(process.env.SUPERADMIN_PASSWORD),
  },
  JWT_TOKENS: {
    ACCESS_TOKEN: {
      ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
      ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME,
    },
    REFRESH_TOKEN: {
      REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
      REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME,
    }
  }
};
