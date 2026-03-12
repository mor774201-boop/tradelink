import { sequelize } from "./src/models";

async function updateDB() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable("users");

        if (!tableInfo.instapay_address) {
            await queryInterface.addColumn("users", "instapay_address", {
                type: "VARCHAR(255)",
                allowNull: true
            });
            console.log("Added instapay_address column");
        }

        if (!tableInfo.vodafone_cash_number) {
            await queryInterface.addColumn("users", "vodafone_cash_number", {
                type: "VARCHAR(255)",
                allowNull: true
            });
            console.log("Added vodafone_cash_number column");
        }

        // Sync Cart and CartItem (New tables)
        await sequelize.sync({ alter: true });
        console.log("Database synced successfully");

        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

updateDB();
