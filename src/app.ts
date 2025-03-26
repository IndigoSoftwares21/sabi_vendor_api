import express from 'express';
import { disconnect } from '@/database';
import monitoring from './utils/monitoring';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares(): void {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        monitoring.info('Initializing routes');
    }

    public async start(port: number): Promise<void> {
        try {
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