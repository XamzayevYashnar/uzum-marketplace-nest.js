import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { env } from '../../config'; // Перенесено для явности, если LoggerBot остался статичным

@Injectable()
export class LoggerBot {
  private static readonly logger = new Logger(LoggerBot.name);

  static async sendMessage(message: string): Promise<void> {
    const rawChatId = env.TELEGRAM?.CHAT_ID;
    const chatId = Number(rawChatId);
    const botToken = env.TELEGRAM?.BOT_TOKEN?.trim();

    if (!botToken || !Number.isFinite(chatId)) {
      this.logger.warn('Telegram configuration is missing or incomplete');
      return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Telegram API error: ${response.status} ${errorText}`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to send Telegram message',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = HttpStatus[statusCode] ?? 'HTTP_ERROR';
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as {
          error?: string;
          code?: string;
          message?: string | string[];
          details?: unknown;
        };
        code = data.code ?? data.error ?? code;
        message = Array.isArray(data.message) ? data.message.join(', ') : data.message ?? message;
        details = data.details;
      }
    } else if (exception && typeof exception === 'object') {
      const err = exception as { code?: string | number; message?: string };
      if (err.code) code = String(err.code);
      if (err.message) message = err.message;
    }

    const errorStack = exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(`${request.method} ${request.url} -> ${statusCode} ${message}`, errorStack);

    if (this.shouldNotifyTelegram(statusCode, code, message)) {
      const telegramMessage = this.buildTelegramMessage({
        request,
        statusCode,
        code,
        message,
        details,
        errorStack,
      });

      LoggerBot.sendMessage(telegramMessage).catch((err) => {
        this.logger.error(`Failed to send error log to Telegram: ${err.message}`);
      });
    }

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private shouldNotifyTelegram(statusCode: number, code: string, message: string): boolean {
    if (statusCode >= 500) return true;

    if (statusCode === 401 || statusCode === 403 || statusCode === 404) return false;

    const lowerCode = code.toLowerCase();
    const lowerMessage = message.toLowerCase();

    const isImportantBadRequest =
      statusCode === 400 &&
      (lowerCode.includes('validation') ||
        lowerCode.includes('invalid') ||
        lowerCode.includes('bad_request') ||
        lowerMessage.includes('validation') ||
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('required') ||
        lowerMessage.includes('must be'));

    return isImportantBadRequest;
  }

  private buildTelegramMessage(data: {
    request: Request;
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    errorStack?: string;
  }): string {
    const { request, statusCode, code, message, details, errorStack } = data;

    const method = this.escapeHtml(request.method);
    const path = this.escapeHtml(request.originalUrl ?? request.url);
    const safeCode = this.escapeHtml(code);
    const safeMessage = this.escapeHtml(message);
    const ip = this.escapeHtml(request.ip ?? 'unknown');
    const userAgent = this.escapeHtml(request.headers['user-agent'] ?? 'unknown');

    const rawDetailsText = details !== undefined ? this.safeJson(details) : 'N/A';
    const safeDetails = this.escapeHtml(this.truncateString(rawDetailsText, 800));
    
    const rawStackText = errorStack ?? 'No stack trace';
    const safeStack = this.escapeHtml(this.truncateString(rawStackText, 1500));

    return [
      '🚨 <b>BACKEND ERROR</b>',
      '',
      `<b>Status:</b> ${statusCode}`,
      `<b>Code:</b> ${safeCode}`,
      `<b>Method:</b> ${method}`,
      `<b>Path:</b> <code>${path}</code>`,
      `<b>IP:</b> ${ip}`,
      '',
      `<b>Message:</b> ${safeMessage}`,
      '',
      '<b>Details:</b>',
      `<pre>${safeDetails}</pre>`,
      '',
      '<b>Stack:</b>',
      `<pre>${safeStack}</pre>`,
      '',
      '<b>User-Agent:</b>',
      `<pre>${userAgent}</pre>`,
      '',
      `<b>Time:</b> ${new Date().toISOString()}`,
    ].join('\n');
  }

  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '\n... [Truncated]';
  }

  private safeJson(value: unknown): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  private escapeHtml(value: unknown): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'); 
  }
}
