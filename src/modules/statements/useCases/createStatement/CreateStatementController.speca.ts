import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `
      INSERT INTO users (id,name,email,password,created_at,updated_at)
      VALUES('${id}', 'admin', 'createstatement@challenge.com', '${password}', now(), now())
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("Should be able to create a statement", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "createstatement@challenge.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit test"
    })
    .set({ Authorization: `Beare ${token}` });

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Withdraw test"
    })
    .set({ Authorization: `Beare ${token}` });


    expect(responseDeposit.status).toBe(201)
    expect(responseWithdraw.status).toBe(201)

  });

  it("Shouldn't be able to create a statement with withdraw type if the user balance didn't have the needed amount", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "createstatement@challenge.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 1000,
      description: "Withdraw test error"
    })
    .set({ Authorization: `Beare ${token}` });

    expect(responseWithdraw.status).toBe(400)
  })
});

