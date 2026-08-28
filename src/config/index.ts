import { config } from 'dotenv';
config();

export const env = {
  PORT: Number(process.env.PORT),
  DB_URI: String(process.env.DB_URI),
  SUPERADMIN: {
    email: String(process.env.SUPERADMIN_EMAIL),
    password: String(process.env.SUPERADMIN_PASSWORD),
  },
};
