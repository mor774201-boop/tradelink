import { sequelize } from "./src/models";

async function fix() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const table = await queryInterface.describeTable("users");

        if (!table.subscription_status) {
            console.log("Adding subscription_status...");
            await sequelize.query("ALTER TABLE users ADD COLUMN subscription_status VARCHAR(255) NOT NULL DEFAULT 'none'");
        }
        if (!table.subscription_expiry) {
            console.log("Adding subscription_expiry...");
            await sequelize.query("ALTER TABLE users ADD COLUMN subscription_expiry DATETIME DEFAULT NULL");
        }
        if (!table.subscription_date) {
            console.log("Adding subscription_date...");
            await sequelize.query("ALTER TABLE users ADD COLUMN subscription_date DATETIME DEFAULT NULL");
        }

        console.log("SUCCESS: Schema updated.");
        process.exit(0);
    } catch (err) {
        console.error("Fix failed:", err);
        process.exit(1);
    }
}

fix();
