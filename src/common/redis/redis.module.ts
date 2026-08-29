import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";
import { env } from "../../config";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                const client = new Redis({
                    host: env.REDIS.host,
                    port: Number(env.REDIS.port)
                });

                client.on('error', (err)=>{
                    console.log("Redis error", err)
                });

                return client
            }
        }
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}