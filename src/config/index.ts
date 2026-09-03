// src/config/index.ts
import * as dotenv from "dotenv";
dotenv.config();

type Unit = "s" | "m" | "h" | "d" | "w" | "y";
type Duration = number | `${number}` | `${number}${Unit}` | `${number} ${Unit}`;

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Env o'zgaruvchi topilmadi: ${key}`);
    return value;
}

function duration(key: string, fallback: Duration): Duration {
    const value = process.env[key];
    if (!value) return fallback;
    return /^\d+$/.test(value) ? Number(value) : (value as Duration);
}

export const env = {
    PORT: Number(process.env.PORT ?? 3000),

    DB_URI: required("DB_URI"),

    SUPERADMIN: {
        email: required("SUPERADMIN_EMAIL"),
        password: required("SUPERADMIN_PASSWORD"),
    },

    JWT_TOKENS: {
        ACCESS_TOKEN: {
            ACCESS_TOKEN_KEY: required("ACCESS_TOKEN_KEY"),
            ACCESS_TOKEN_TIME: duration("ACCESS_TOKEN_TIME", "15m"),
        },
        REFRESH_TOKEN: {
            REFRESH_TOKEN_KEY: required("REFRESH_TOKEN_KEY"),
            REFRESH_TOKEN_TIME: duration("REFRESH_TOKEN_TIME", "7d"),
        },
    },

    REDIS: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },

    RESEND: {
        RESEND_API_KEY: process.env.RESEND_API_KEY
    },

    TRANSPORT: {
        host: process.env.MAIL_HOST,
        PORT: process.env.MAIL_PORT,
        AUTH: {
            user: process.env.MAIL_EMAIL,
            password: process.env.MAIL_PASSWORD,
        },
    },
};