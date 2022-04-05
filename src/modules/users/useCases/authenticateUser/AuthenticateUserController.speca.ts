import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate user", () => {
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
  it("Should be able to authenticate a user", async () => {

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@challenge.com",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token")
  });

  it("Shuldn't be able to authenticate an nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "abroba@challenge.com",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });
  it("Shuldn't be able to authenticate an user if the password is incorrect", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@challenge.com",
      password: "abroba",
    });

    expect(response.status).toBe(401);
  });
});
