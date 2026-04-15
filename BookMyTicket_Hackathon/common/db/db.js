import pg from "pg";
import "dotenv/config";
import ApiError from "../utils/apiError.js";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
});

export async function checkIfUserExists(username) {
    const sqlQuery = "SELECT 1 FROM users WHERE username=$1 LIMIT 1";
    const result = await pool.query(sqlQuery, [username]);

    return result.rowCount > 0;
}

export async function insertUser(username, password) {
    const sqlQuery = `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING *;`;

    try {
        const result = await pool.query(sqlQuery, [username, password]);
        return result.rows[0];
    }
    catch (err) {
        if (err.code === "23505") {
            throw ApiError.conflict("Username already exists!");
        }
        throw err;
    }
}

export async function getUser(username) {
    const sqlQuery = `SELECT * FROM users WHERE username=$1 LIMIT 1;`;
    const result = await pool.query(sqlQuery, [username]);
    return result.rows[0];
}

export async function updateRefreshToken(username, refreshToken) {
    const sqlQuery = `
        UPDATE users
        SET refresh_token = $1
        WHERE username = $2;
    `;
    const result = await pool.query(sqlQuery, [refreshToken, username]);
    if (result.rowCount === 0) {
        throw ApiError.notfound("User not found!");
    }
    return true;
}


export default pool;