import { User } from "./src/models/User";
import { Role } from "./src/models/Role";

async function run() {
    try {
        const roles = await Role.findAll();
        const wholesalerRole = roles.find(r => r.name === 'Wholesaler');
        if (!wholesalerRole) {
            console.log("Wholesaler role not found");
            return;
        }
        const users = await User.findAll({ where: { role_id: wholesalerRole.id } });
        console.log("Wholesalers found:");
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
        });
    } catch (e) {
        console.error(e);
    }
}

run();
