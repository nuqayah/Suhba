import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/lib/database/schema.js',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: './suhba.db'
    },
    verbose: true,
    strict: true
});
