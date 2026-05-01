const request = require("supertest");
const mongoose = require("mongoose");
const buildApp = require("../src/app");
const User = require("../src/models/User");
const Account = require("../src/models/Account");

const app = buildApp();

describe("Account API", () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: "Account Tester",
      email: "account@example.com",
      password: await User.hashPassword("Password123!"),
    });
    userId = user._id;

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "account@example.com", password: "Password123!" });
    
    token = loginRes.body.data.token;
  });

  it("should create a new account", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Checking",
        type: "bank",
        openingBalance: 1500,
        currency: "USD",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Checking");
    expect(res.body.data.currentBalance).toBe(1500);
  });

  it("should get all accounts for the user", async () => {
    await Account.create({
      user: userId,
      name: "Savings",
      type: "bank",
      openingBalance: 5000,
      currentBalance: 5000,
      currency: "USD"
    });

    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Savings");
  });
});
