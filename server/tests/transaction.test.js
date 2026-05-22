const request = require("supertest");
const buildApp = require("../src/app");
const User = require("../src/models/User");
const Account = require("../src/models/Account");
const Category = require("../src/models/Category");

const app = buildApp();

describe("Transaction API", () => {
  let token;
  let userId;
  let accountId;
  let categoryId;

  beforeEach(async () => {
    const user = await User.create({
      name: "Tx Tester",
      email: "tx@example.com",
      password: await User.hashPassword("Password123!"),
    });
    userId = user._id;

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "tx@example.com", password: "Password123!" });
    
    token = loginRes.body.data.token;

    const account = await Account.create({
      user: userId,
      name: "Main",
      type: "bank",
      openingBalance: 1000,
      currentBalance: 1000,
    });
    accountId = account._id;

    const category = await Category.create({
      user: userId,
      name: "Food",
      kind: "expense",
      color: "#FF0000",
      icon: "food",
    });
    categoryId = category._id;
  });

  it("should create a new transaction", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        account: accountId,
        category: categoryId,
        amount: 50,
        type: "expense",
        date: new Date().toISOString(),
        description: "Lunch",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(50);
  });
});
