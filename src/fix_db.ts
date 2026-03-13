import { sequelize } from "./models";

async function fix() {
    try {
        await sequelize.authenticate();
        console.log("Database connected. checking users table for new columns...");
        
        const columns = [
            { name: "governorate", type: "VARCHAR(255) DEFAULT null" },
            { name: "center", type: "VARCHAR(255) DEFAULT null" },
            { name: "is_phone_verified", type: "BOOLEAN DEFAULT false" }
        ];

        for (const col of columns) {
            try {
                await sequelize.query(`SELECT ${col.name} FROM users LIMIT 1`);
                console.log(`Column ${col.name} already exists.`);
            } catch (e) {
                console.log(`Adding ${col.name} to users...`);
                await sequelize.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
            }
        }

        console.log("Database schema update complete!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

fix();
