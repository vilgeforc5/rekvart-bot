# Logging Configuration

This backend uses **Pino** for high-performance, structured logging.

## Quick Start

### Environment Variables

Add these to your `.env` file:

```env
LOG_LEVEL=info
NODE_ENV=development
LOG_TO_FILE=false
```

### Available Log Levels

From least to most verbose:

- `fatal` - Application-breaking errors
- `error` - Errors that don't stop the app
- `warn` - Warnings
- `info` - General information (default)
- `debug` - Debugging information (includes DB queries)
- `trace` - Very detailed traces

## Logging Modes

### 1. Console Logging (Default)

**Development** (NODE_ENV=development):

- Pretty-printed, colorized output
- Human-readable timestamps
- Easier to read in terminal

**Production** (NODE_ENV=production, LOG_TO_FILE=false):

- JSON formatted logs to stdout
- Suitable for Docker/Kubernetes log collection
- Ready for log aggregation tools

### 2. File Logging (Optional)

Set `LOG_TO_FILE=true` in production to write logs to files:

- Logs saved to `logs/app.log`
- Automatic daily rotation
- Directory created automatically

## What Gets Logged

### Form Submissions

```
INFO: Processing form submission
  - commandName, chatId, dataKeys

INFO: Form submission saved to database
  - submissionId, userId, commandName

INFO: Topic connection created in database
  - connectionId, topicId, chatId

INFO: Notification sent to forum topic
  - topicId, commandName
```

### Dialog Management

```
INFO: Starting dialog with user
  - topicId, userChatId

INFO: Dialog connection activated in database
  - connectionId, topicId

INFO: Operator connected message sent to user
  - userChatId, topicId

DEBUG: User message forwarded to topic
  - userChatId, messageId, topicId
```

### Database Operations (DEBUG level)

```
DEBUG: Database query executed
  - query, params, duration

INFO: Database connected successfully
```

### HTTP Requests

```
INFO: Request received
  - method, url, params, query, statusCode
```

## Usage in Code

### Inject Logger in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class MyService {
  constructor(
    @InjectPinoLogger(MyService.name)
    private readonly logger: PinoLogger,
  ) {}

  async myMethod() {
    this.logger.info({ userId: 123, action: 'login' }, 'User logged in');

    try {
      const result = await this.doSomething();
      this.logger.debug({ result }, 'Operation successful');
      return result;
    } catch (error) {
      this.logger.error({ error, userId: 123 }, 'Operation failed');
      throw error;
    }
  }
}
```

### Structured Logging Best Practices

Always pass context as the first parameter (object), message as second:

```typescript
this.logger.info(
  {
    userId: user.id,
    action: 'form_submission',
    formType: 'calculate',
    timestamp: new Date(),
  },
  'Form submitted successfully',
);
```

## Security

The following fields are automatically redacted from logs:

- `req.headers.authorization`
- `req.headers.cookie`
- Any field named `password`
- Any field named `token`

## Performance

- **Pino is extremely fast** - one of the fastest Node.js loggers
- Database query logging only enabled at `debug` level
- Use `info` or higher in production for best performance
- HTTP /health endpoint is excluded from logging

## File Logging Setup

File logging with `pino-roll` is **optional**. It's already installed, to enable it:

1. Set environment variable:

   ```env
   LOG_TO_FILE=true
   NODE_ENV=production
   ```

2. Logs will be written to `logs/app.log`
3. Files rotate daily automatically
4. Old logs: `logs/app.log.1`, `logs/app.log.2`, etc.

## Viewing Production Logs

If logging to stdout as JSON, pipe through pino-pretty:

```bash
node dist/main.js | npx pino-pretty
```

Or in Docker:

```bash
docker logs container-name | npx pino-pretty
```

## Recommendations

### Development

```env
LOG_LEVEL=debug
NODE_ENV=development
LOG_TO_FILE=false
```

### Production (Container/Cloud)

```env
LOG_LEVEL=info
NODE_ENV=production
LOG_TO_FILE=false
```

Let your container platform handle log collection.

### Production (Traditional Server)

```env
LOG_LEVEL=info
NODE_ENV=production
LOG_TO_FILE=true
```

Logs saved to files with daily rotation.

## Troubleshooting

**No logs appearing:**

- Check `LOG_LEVEL` is not set to `fatal` or `error`
- Verify logger is injected with `@InjectPinoLogger()`
- Check `LoggerModule` is imported in `AppModule`

**Too many logs:**

- Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`
- Database queries only log at `debug` level

**File logging not working:**

- Verify `LOG_TO_FILE=true` is set
- Ensure `NODE_ENV=production`
- Check write permissions for `logs/` directory
