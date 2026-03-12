import { sequelize } from "./src/models";
import { User } from "./src/models/User";

async function check() {
    try {
        const columns = await sequelize.getQueryInterface().describeTable("users");
        console.log("Columns in users table:", Object.keys(columns));
        if (columns.subscription_status) {
            console.log("SUCCESS: subscription_status column exists.");
        } else {
            console.log("FAILURE: subscription_status column is MISSING.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Check failed:", err);
        process.exit(1);
    }
}

check();
