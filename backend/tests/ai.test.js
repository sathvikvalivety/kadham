const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const config = require("../src/config");

function getTestToken() {
  const payload = { sub: 1, email: "test@example.com", role: "user" };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
}

describe("AI verification stub", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/ai/verify").send({ depositId: 1 });
    expect(res.statusCode).toBe(401);
  });

  it("rejects invalid payloads", async () => {
    const token = getTestToken();
    const res = await request(app)
      .post("/api/ai/verify")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
});
