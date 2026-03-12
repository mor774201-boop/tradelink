import { Product, User } from "./src/models";
import { sequelize } from "./src/models";
import { initModels } from "./models/initModels";

async function check() {
    try {
        await sequelize.authenticate();
        initModels();
        const users = await User.count();
        const products = await Product.count();
        console.log(`Users: ${users}, Products: ${products}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
