"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const httpLogger = new common_1.Logger('HTTP');
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
        exposedHeaders: ['Access-Control-Allow-Origin'],
        preflightContinue: false,
    });
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const durationMs = Date.now() - start;
            const url = req.originalUrl || req.url;
            httpLogger.log(`${req.method} ${url} ${res.statusCode} ${durationMs}ms`);
        });
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        disableErrorMessages: false,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const port = configService.get('PORT') || process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map