/* eslint-disable no-underscore-dangle */
import { Pool, QueryResult } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';
import get from 'lodash/get';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';
import * as monitoring from '@/utils/monitoring';
import nestTabularData from '@/utils/nestTabularData';

dotenv.config();

// DATABASE_URL is available on DOKKU
const connectionDetails = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
};

console.log('Connecting to PostgreSQL database...');
if (!connectionDetails.host) {
    console.error('Database host is missing.');
    process.exit(1);
}
if (!connectionDetails.user) {
    console.error('Database user is missing.');
    process.exit(1);
}
if (!connectionDetails.password) {
    console.error('Database password is missing.');
    process.exit(1);
}
if (!connectionDetails.database) {
    console.error('Database name is missing.');
    process.exit(1);
}
if (!connectionDetails.port) {
    console.error('Database port is missing.');
    process.exit(1);
}

const CONFIG = {
    ...connectionDetails,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

const pool = new Pool(CONFIG);
let transactionStack: Error[] = [];
let queryLog: string[] = [];
const ESCAPE_SYMBOL = Symbol('ESCAPED');

// Setup connection error handling
pool.on('error', (err) => {
    monitoring.error('Unexpected PostgreSQL client error', err);
});

// Type definitions

type QueryResultFunction = (...args: any[]) => Promise<QueryResult<any>>;

/**
 * Builds a parameterized SQL query string using tagged template literals.
 */
function sql(strings: TemplateStringsArray, ...rest: any[]): string {
    let escapedQuery = '';
    strings.forEach((string, i) => {
        const paramToEscape = rest[i];
        if (paramToEscape !== undefined) {
            const hasItBeenEscapedBefore =
                get(paramToEscape, '_escaped_before') === ESCAPE_SYMBOL;

            if (!hasItBeenEscapedBefore) {
                escapedQuery += string + `$${i + 1}`;
            } else {
                escapedQuery += string + paramToEscape;
            }
        } else {
            escapedQuery += string;
        }
    });
    return escapedQuery;
}

/**
 * Escapes a SQL identifier (e.g., table or column name) for safe use.
 */
function sqlId(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Converts a value to a SQL-compatible string or NULL.
 */
function sqlValueOrNull(val: any): string {
    return val === undefined || val === null ? 'NULL' : String(val);
}

/**
 * Executes a parameterized SQL query and returns the full QueryResult.
 */
async function submitQuery(strings: TemplateStringsArray, ...rest: any[]): Promise<any[]> {
    let client;
    try {
        client = await pool.connect();
        const escapedQuery = sql(strings, ...rest);

        if (strings[0].toLowerCase().includes('debug')) {
            console.log(`\x1B[36m${escapedQuery}\x1B[39m`);
        }

        if (process.env.NODE_ENV === 'test') {
            queryLog.push(escapedQuery);
        }

        return (await client.query(escapedQuery, rest)).rows;
    } catch (err) {
        monitoring.error('Query execution failed', err instanceof Error ? err : new Error(String(err)));
        throw err;
    } finally {
        if (client) client.release();
    }
}

/**
 * Executes a parameterized SQL query and returns only the rows.
 */
async function submitQueryRows(strings: TemplateStringsArray, ...rest: any[]): Promise<any[]> {
    const result = await submitQuery(strings, ...rest);
    return result;
}

/**
 * Starts a new database transaction if not already in one.
 */
async function startTransaction(): Promise<void> {
    const client = await pool.connect();
    const traceLabel = `${new Date()}: Uncommitted Transaction @`;
    const stack = new Error(traceLabel);

    try {
        if (transactionStack.length > 0) {
            return;
        }

        await client.query('BEGIN');
        transactionStack.push(stack);
    } catch (err) {
        monitoring.error('Failed to start transaction', err instanceof Error ? err : new Error(String(err)));
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Commits the outermost transaction.
 */
async function commitTransaction(): Promise<void> {
    const client = await pool.connect();
    const lastTransaction = transactionStack.pop();

    try {
        if (!lastTransaction) {
            console.trace('committing non-existing transaction');
        }

        if (transactionStack.length === 0) {
            await client.query('COMMIT');
        }
    } catch (err) {
        monitoring.error('Failed to commit transaction', err instanceof Error ? err : new Error(String(err)));
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Rolls back the current transaction and clears the stack.
 */
async function rollbackTransaction(): Promise<void> {
    const client = await pool.connect();
    const lastTransaction = transactionStack.pop();

    try {
        if (!lastTransaction) {
            console.trace('rolling back non-existing transaction');
        }

        transactionStack = [];
        await client.query('ROLLBACK');
    } catch (err) {
        monitoring.error('Failed to rollback transaction', err instanceof Error ? err : new Error(String(err)));
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Transforms result keys to camelCase.
 */
function camelKeys(query: any): any {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.map(d => mapKeys(d, (v, k) => camelCase(k)));
    };
}

/**
 * Returns the first result or a specific property.
 */
function getFirst(
    query: any,
    propertyToGet: string | null = null,
    defaultValue: any = null
): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => {
        const results = await query(...args);
        const pathToGet = propertyToGet ? `[0].${propertyToGet}` : '[0]';
        return get(results, pathToGet, defaultValue);
    };
}

/**
 * Extracts a specific property from all results.
 */
function getProperty(
    query: any,
    propertyToGet: string,
    defaultValue: any = null
): (...args: any[]) => Promise<any[]> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.map(result => get(result, propertyToGet, defaultValue));
    };
}

/**
 * Returns an array of inserted IDs (assumes a 'RETURNING id' clause in the query).
 */
function getInsertIds(query: any): (...args: any[]) => Promise<number[]> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.map(row => row.id);
    };
}

/**
 * Returns the first inserted ID (assumes a 'RETURNING id' clause in the query).
 */
function getInsertId(query: any): (...args: any[]) => Promise<number | undefined> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results[0]?.id;
    };
}

/**
 * Nests tabular data based on options.
 */
function nest(query: any, nestOptions: any): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return nestTabularData(results, nestOptions);
    };
}

/**
 * Reduces values into a comma-separated SQL string.
 */
function sqlReduce(accumulator: string, currentValue: any): string {
    return `${accumulator}, ${currentValue}`;
}

/**
 * Combines SQL queries with UNION ALL.
 */
function sqlReduceWithUnion(accumulatedQuery: string, currentQuery: string): string {
    return `
        ${accumulatedQuery}
        UNION ALL
        ${currentQuery}
    `;
}

/**
 * Closes the database connection pool.
 */
async function disconnect(): Promise<void> {
    await pool.end();
}

/** Gets the transaction stack (for testing) */
function _getTransactionStack(): Error[] {
    return transactionStack;
}

/** Gets the query log (for testing) */
function _getQueryLog(): string[] {
    return queryLog;
}

/** Resets the query log (for testing) */
function _resetTestQueryLog(): void {
    queryLog.length = 0;
}

export {
    submitQuery,
    submitQueryRows, // New export for row-only queries
    sql,
    sqlId,
    sqlValueOrNull,
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    camelKeys,
    getFirst,
    getProperty,
    getInsertIds,
    getInsertId,
    nest,
    sqlReduce,
    sqlReduceWithUnion,
    disconnect,
    _getTransactionStack,
    _getQueryLog,
    _resetTestQueryLog
};