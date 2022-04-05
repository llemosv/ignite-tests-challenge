import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `
      INSERT INTO users (id,name,email,password,created_at,updated_at)
      VALUES('${id}', 'admin', 'getstatement@challenge.com', '${password}', now(), now())
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("Should be able to find a user statment", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "getstatement@challenge.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "deposit test"
    })
    .set({ Authorization: `Beare ${token}` });

    const { id } = responseDeposit.body

    const response = await request(app).get(`/api/v1/statements/${id}`)
    .send()
    .set({ Authorization: `Beare ${token}` });

    expect(response.status).toBe(200)
    expect(response.body.amount).toBe(('100.00'))


  });
});

