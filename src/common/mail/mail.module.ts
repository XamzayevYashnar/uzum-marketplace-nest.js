import { Module, Global } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer"
import { env } from "../../config";

@Global()
@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: env.TRANSPORT.host,
                port: Number(env.TRANSPORT.PORT),
                secure: true,
                auth: {
                    user: env.TRANSPORT.AUTH.user,
                    pass: env.TRANSPORT.AUTH.password,
                },
            },
            defaults: {
                from: '"No Reply" <xamzayevyashnar060@gmail.com>',
            },
        })
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}