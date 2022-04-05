import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("Should be able to crate a user", async () => {

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Supertest",
        email: "user@supertest.com",
        password: "B@c0n"
      });

    expect(response.status).toBe(201);
  });

  it("Shouldn't be able to crate a user with a already exists e-mail", async () =>{
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "User Supertest2",
      email: "user@supertest.com",
      password: "B@c0n"
    });

    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "User Supertest3",
      email: "user@supertest.com",
      password: "B@c0n"
    });

    expect(response.status).toBe(400);
  });
});
