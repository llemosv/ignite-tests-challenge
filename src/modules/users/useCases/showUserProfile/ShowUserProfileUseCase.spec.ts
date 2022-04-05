import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const testUser: ICreateUserDTO = {
  email: "user@test.com",
  password: "1234",
  name: "User Test",
};

describe("Show user", () =>{
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("Should be able to find a user by id", async () => {
    const newUser = await createUserUseCase.execute(testUser);
    const newUserID = !newUser.id ? 'Error' : newUser.id

    const foundUser = await showUserProfileUseCase.execute(newUserID)

    expect(foundUser).toHaveProperty("id", newUserID)

  })

  it("Shouldn't be able to find a user if it dosen't exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('undefinedId')
    }).rejects.toBeInstanceOf(AppError)
  })
})
