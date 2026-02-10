const db = require("../src/db");

async function resetClaims() {
    console.log("🔄 Resetting deposit claims...");
    try {
        // Allows approved deposits to be claimed again by clearing tx_hash
        const [result] = await db.execute(
            "UPDATE waste_deposits SET tx_hash = NULL WHERE status = 'APPROVED' AND tx_hash IS NOT NULL"
        );
        console.log(`✅ Reset ${result.affectedRows} deposits based on recent contract deployment.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Reset failed:", err);
        process.exit(1);
    }
}

resetClaims();
