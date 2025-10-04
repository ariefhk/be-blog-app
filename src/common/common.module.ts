/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { PrismaService } from './prisma.service';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          // Handle Prisma query logs specially
          if (meta.target === 'quaint::connector::metrics' || meta.query) {
            return `${timestamp} [${level.toUpperCase()}] Query: ${meta.query}\n  Duration: ${meta.duration}ms\n  Params: ${meta.params}`;
          }

          // Handle Prisma event logs (when message is an object)
          if (typeof message === 'object' && message !== null) {
            const event = message as any;
            if (event.query) {
              return `${timestamp} [${level.toUpperCase()}] Query: ${event.query}\n  Duration: ${event.duration}ms\n  Params: ${event.params}`;
            }
            // Handle request/response logs from interceptor
            if (event.pipeline) {
              return `${timestamp} [${level.toUpperCase()}] ${event.pipeline.toUpperCase()}: ${event.method} ${event.path}\n  IP: ${event.ip}\n  User: ${event.user} (${event.userId})\n  UserAgent: ${event.userAgent}`;
            }
            return `${timestamp} [${level.toUpperCase()}] ${JSON.stringify(message, null, 2)}`;
          }

          // Handle other logs
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : '';
          return `${timestamp} [${level.toUpperCase()}] ${message || 'No message'}${metaStr || ''}`;
        }),
      ),
      transports: [new transports.Console()],
    }),
  ],
  providers: [PrismaService, ResponseInterceptor],
  exports: [PrismaService, ResponseInterceptor],
})
export class CommonModule {}
