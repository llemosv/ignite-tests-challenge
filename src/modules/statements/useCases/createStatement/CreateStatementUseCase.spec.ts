import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

const testUser: ICreateUserDTO = {
  email: "user@test.com",
  password: "1234",
  name: "User Test",
};
enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}
describe("Create a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("Should be able to create a statement", async () => {
    const createdUser = await createUserUseCase.execute(testUser)

    const statement = await createStatementUseCase.execute({
      user_id: !createdUser.id ? 'Error' : createdUser.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "test"
    })

    expect(statement).toHaveProperty("id");
  })

  it("Shouldn't be able to create a statement with withdraw type if the user balance didn't have the needed amount", async () => {
    const createdUser = await createUserUseCase.execute(testUser)
    expect(async () =>{
      await createStatementUseCase.execute({
        user_id: !createdUser.id ? 'Error' : createdUser.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "test"
      })
    }).rejects.toBeInstanceOf(AppError);
  })
})
