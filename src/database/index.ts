/* eslint-disable no-underscore-dangle */
import { Pool, QueryResult } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';
import get from 'lodash/get';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';
import * as monitoring from '@/utils/monitoring';
import nestTabularData from '@/utils/nestTabularData';

dotenv.config()



// DATABASE_URL is available on DOKKU
const connectionDetails = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432', 10)
};

console.log('Connecting to PostgreSQL database...');
if (!connectionDetails.host) {
    console.error('Database connection details are missing.');
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
    max: 20, // connection pool max size
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // how long to wait when connecting before timing out
};

const pool = new Pool(CONFIG);
let transactionStack: Error[] = [];
const queryLog: string[] = [];
const ESCAPE_SYMBOL = Symbol('ESCAPED');

// Setup connection error handling
pool.on('error', (err) => {
    monitoring.error('Unexpected PostgreSQL client error', err);
});

/** Type definition for a query function that returns a Promise of an array */
type QueryFunction = (...args: any[]) => Promise<any[]>;

/** Type definition for a query function that returns a Promise of QueryResult */
type QueryResultFunction = (...args: any[]) => Promise<QueryResult>;

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
 * Executes a parameterized SQL query and returns the result.
 */
async function submitQuery(strings: TemplateStringsArray, ...rest: any[]): Promise<QueryResult> {
    const client = await pool.connect();
    try {
        const escapedQuery = sql(strings, ...rest);

        if (strings[0].toLowerCase().includes('debug')) {
            console.log(`\x1B[36m${escapedQuery}\x1B[39m`);
        }

        if (process.env.NODE_ENV === 'test') {
            queryLog.push(escapedQuery);
        }

        return await client.query(escapedQuery, rest);
    } finally {
        client.release();
    }
}

/**
 * Starts a new database transaction if not already in one.
 */
async function startTransaction(): Promise<void> {
    const client = await pool.connect();
    const traceLabel = `${new Date()}: Uncommitted Transaction @`;
    const stack = new Error(traceLabel);

    if (transactionStack.length > 0) {
        client.release();
        return;
    }

    await client.query('BEGIN');
    transactionStack.push(stack);
    client.release();
}

/**
 * Commits the outermost transaction.
 */
async function commitTransaction(): Promise<void> {
    const client = await pool.connect();
    const lastTransaction = transactionStack.pop();

    if (!lastTransaction) {
        console.trace('committing non-existing transaction');
    }

    if (transactionStack.length === 0) {
        await client.query('COMMIT');
    }
    client.release();
}

/**
 * Rolls back the current transaction and clears the stack.
 */
async function rollbackTransaction(): Promise<void> {
    const client = await pool.connect();
    const lastTransaction = transactionStack.pop();

    if (!lastTransaction) {
        console.trace('rolling back non-existing transaction');
    }

    transactionStack = [];
    await client.query('ROLLBACK');
    client.release();
}

/**
 * Transforms result keys to camelCase.
 */
function camelKeys(query: QueryFunction): QueryFunction {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.map(d => mapKeys(d, (v, k) => camelCase(k)));
    };
}

/**
 * Returns the first result or a specific property.
 */
function getFirst(
    query: QueryFunction,
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
    query: QueryFunction,
    propertyToGet: string,
    defaultValue: any = null
): (...args: any[]) => Promise<any[]> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.map(result => get(result, propertyToGet, defaultValue));
    };
}

/**
 * Returns an array of inserted IDs.
 */
function getInsertIds(query: QueryResultFunction): (...args: any[]) => Promise<number[]> {
    return async (...args: any[]) => {
        const results = await query(...args);
        const insertIds: number[] = [];
        const firstInsertId = results.rows[0]?.id || 0;

        for (let i = 0; i < (results.rowCount || 0); i += 1) {
            insertIds.push(firstInsertId + i);
        }

        return insertIds;
    };
}

/**
 * Returns the first inserted ID.
 */
function getInsertId(query: QueryResultFunction): (...args: any[]) => Promise<number | undefined> {
    return async (...args: any[]) => {
        const results = await query(...args);
        return results.rows[0]?.id;
    };
}

/**
 * Nests tabular data based on options.
 */
function nest(query: QueryFunction, nestOptions: any): (...args: any[]) => Promise<any> {
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