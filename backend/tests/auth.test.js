const request = require("supertest");

const app = require("../src/app");

describe("Auth API", () => {
  it("rejects invalid registration payloads", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBe(400);
  });
});
