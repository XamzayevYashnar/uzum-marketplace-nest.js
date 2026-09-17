import { Injectable, Logger } from "@nestjs/common";
import { env } from "../../config";

@Injectable()
export class LoggerBot {
    static logger = new Logger(
        LoggerBot.name
    );

    static async sendMessage(message: string): Promise<void> {
        const rawChatId = env.TELEGRAM?.CHAT_ID;
        const chatId = Number(rawChatId);
        const botToken = env.TELEGRAM?.BOT_TOKEN?.trim();

        if (!botToken || !Number.isFinite(chatId)) {
            this.logger.warn(
                "Telegram configuration is missing or invalid",
            );
            return;
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                }),
            });

            if (!response.ok){
                const errorText = await response.text();
                this.logger.error(
                    `Telegram API error: ${response.status} ${errorText}`
                );
            }

        } catch (error) {
            this.logger.error(
                'Failed to send Telegram message',
                error instanceof Error
                    ? error.stack
                    : String(error),
            );
        }
    }
}