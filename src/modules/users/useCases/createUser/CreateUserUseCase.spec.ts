import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const testUser: ICreateUserDTO = {
  email: "user@test.com",
  password: "1234",
  name: "User Test",
};

describe("Create user", () =>{
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to crate a user", async ()=>{
    const newUser = await createUserUseCase.execute(testUser);
    expect(newUser).toHaveProperty("id");
  })

  it("Shouldn't be able to crate a user with a already exists e-mail", async () =>{
    expect(async () =>{
      await createUserUseCase.execute(testUser);
      await createUserUseCase.execute(testUser);
    }).rejects.toBeInstanceOf(AppError)
  })
})
