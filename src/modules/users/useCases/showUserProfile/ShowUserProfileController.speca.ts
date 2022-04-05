import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Show user profile", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `
      INSERT INTO users (id,name,email,password,created_at,updated_at)
      VALUES('${id}', 'admin', 'admin@challenge.com', '${password}', now(), now())
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("Should be able to find a user by id", async () => {

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@challenge.com",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile")
    .send()
    .set({ Authorization: `Beare ${token}` });

    expect(response.status).toBe(200);
  });

  it("Shouldn't be able to find a user if it dosen't exists", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admain@challenge.com",
      password: "admin",
    });

    expect(responseToken.status).toBe(401);
  });
});
