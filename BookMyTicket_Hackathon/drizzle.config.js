import "dotenv/config";

export default {
    schema: "./common/db/schema.js",
    out: "./drizzle",               
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};