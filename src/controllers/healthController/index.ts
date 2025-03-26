import { Request, Response } from 'express';
import HealthService from '@/services/healthService';

export class HealthController {
    async healthCheck(req: Request, res: Response): Promise<void> {
        try {
            const dbHealth = await HealthService.checkDatabaseHealth();

            await HealthService.recordHealthCheck();

            res.status(200).json({
                status: 'OK',
                database: dbHealth ? 'Connected' : 'Disconnected',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                message: 'Health check failed'
            });
        }
    }
}

export default new HealthController();