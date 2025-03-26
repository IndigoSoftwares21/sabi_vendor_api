import { submitQuery } from '@/database';

export class HealthService {
    async checkDatabaseHealth(): Promise<boolean> {
        try {
            const result = await submitQuery`SELECT NOW()`;
            return result.rows.length > 0;
        } catch (error) {
            return false;
        }
    }

    async recordHealthCheck(): Promise<void> {
        await submitQuery`INSERT INTO health_check (status) VALUES ($1) RETURNING id AS "id"`;
    }
}

export default new HealthService();