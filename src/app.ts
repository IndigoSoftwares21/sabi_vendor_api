import express from 'express';
import { disconnect } from '@/database';
import monitoring from './utils/monitoring';
import hubRoutes from '@/routes/hub.routes';
import appRoutes from '@/routes/app.routes';
import sharedRoutes from '@/routes/shared.routes';

import dotenv from 'dotenv';
import cors from 'cors';
const corsOptions = {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
};
class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares(): void {
        this.express.use(cors(corsOptions));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        monitoring.info('Initializing routes');
        this.express.use("/api/v1/hub", hubRoutes);
        this.express.use("/api/v1/app", appRoutes);
        this.express.use("/api/v1/shared", sharedRoutes);
    }

    public async start(port: number): Promise<void> {
        try {
            dotenv.config();
            this.express.listen(port, () => {
                monitoring.info(`Server running on port ${port}`);
            });
        } catch (error: any) {
            monitoring.error('Failed to start server:', error);
            await disconnect();
            process.exit(1);
        }
    }
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = new App();
app.start(PORT);

export default app;