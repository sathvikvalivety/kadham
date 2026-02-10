const db = require("../src/db");

async function seedProducts() {
    console.log("🌱 Seeding eco-products...");

    try {
        // Clear existing products to avoid duplicates if run multiple times
        await db.execute("DELETE FROM eco_products");

        const products = [
            {
                name: "Bamboo Toothbrush Set",
                description: "A pack of 4 biodegradable bamboo toothbrushes with charcoal bristles.",
                eco_score: 50,
                price_gbc: 5.0,
                sku: "BAMBOO-TB-001"
            },
            {
                name: "Stainless Steel Water Bottle",
                description: "Insulated 500ml water bottle. Keeps water cold for 24 hours.",
                eco_score: 120,
                price_gbc: 15.0,
                sku: "STEEL-BOT-001"
            },
            {
                name: "Solar Power Bank",
                description: "10000mAh portable charger with solar panel for emergency charging.",
                eco_score: 200,
                price_gbc: 25.0,
                sku: "SOLAR-PB-001"
            },
            {
                name: "Reusable Produce Bags",
                description: "Set of 5 organic cotton mesh bags for grocery shopping.",
                eco_score: 80,
                price_gbc: 8.0,
                sku: "MESH-BAG-001"
            },
            {
                name: "Recycled Notebook",
                description: "A5 Notebook made from 100% post-consumer recycled paper.",
                eco_score: 40,
                price_gbc: 4.0,
                sku: "RECYC-NB-001"
            },
            {
                name: "Compost Bin (Countertop)",
                description: "Odor-free stainless steel compost bin for kitchen scraps.",
                eco_score: 150,
                price_gbc: 18.0,
                sku: "COMP-BIN-001"
            }
        ];

        for (const p of products) {
            await db.execute(
                "INSERT INTO eco_products (name, description, eco_score, price_gbc, sku) VALUES (?, ?, ?, ?, ?)",
                [p.name, p.description, p.eco_score, p.price_gbc, p.sku]
            );
            console.log(`✅ Added: ${p.name}`);
        }

        console.log("✨ Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seedProducts();
