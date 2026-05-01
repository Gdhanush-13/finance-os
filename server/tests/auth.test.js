const request = require("supertest");
const buildApp = require("../src/app");
const User = require("../src/models/User");

const app = buildApp();

describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty("email", testUser.email);
    expect(res.body.data.token).toBeDefined();

    const dbUser = await User.findOne({ email: testUser.email });
    expect(dbUser).toBeTruthy();
  });

  it("should login an existing user", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should get current user profile with valid token", async () => {
    const regRes = await request(app).post("/api/auth/register").send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
});
