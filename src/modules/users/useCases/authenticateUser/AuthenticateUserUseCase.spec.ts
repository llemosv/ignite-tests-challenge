import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"


let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const testUser: ICreateUserDTO = {
  email: "user@test.com",
  password: "1234",
  name: "User Test",
};

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to authenticate a user", async () => {
    await createUserUseCase.execute(testUser)

    const token = await authenticateUserUseCase.execute(
      {
        email: testUser.email,
        password: testUser.password
      }
    )

    expect(token).toHaveProperty("token")
  })

  it("Shuldn't be able to authenticate an nonexistent user", async () => {
    expect(async ()=>{
      await authenticateUserUseCase.execute(
        {
          email: 'nonexistent@test.com',
          password: 'T3stP@sw0rd'
        }
      )
    }).rejects.toBeInstanceOf(AppError)
  })

  it("Shuldn't be able to authenticate an user if the password is incorrect", async () => {
    await createUserUseCase.execute(testUser)
    expect(async ()=>{
      await authenticateUserUseCase.execute(
        {
          email: testUser.email,
          password: 'T3stP@sw0rd'
        }
      )
    }).rejects.toBeInstanceOf(AppError)
  })
})
