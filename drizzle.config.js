/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_GH7tJZM2Dmdo@ep-dark-paper-ad37a7sk-pooler.c-2.us-east-1.aws.neon.tech/ai-interview-mocker?sslmode=require&channel_binding=require',
    }
};