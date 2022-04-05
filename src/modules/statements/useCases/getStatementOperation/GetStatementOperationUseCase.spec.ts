import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase
const testUser: ICreateUserDTO = {
  email: "user@test.com",
  password: "1234",
  name: "User Test",
};
enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}
describe("get a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
  })

  it("Should be able to find a user statment", async () => {
    const createdUser = await createUserUseCase.execute(testUser)

    const user_id = !createdUser.id ? 'Error' : createdUser.id

    const statement = await createStatementUseCase.execute({
      user_id: user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "test"
    });

    const statement_id = !statement.id ? 'Error' : statement.id

    const response = await getStatementOperationUseCase.execute({user_id, statement_id})

    expect(response).toBe(statement)
  });

  it("Shouldn't be able to find a statment if user doesn't exists", async() => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
          user_id :'nonexistent_user',
          statement_id : 'nonexistent_statement'
        })
    }).rejects.toBeInstanceOf(AppError);
  })

  it("Shouldn't be able to find a nonexistent statment", async() => {

    const createdUser = await createUserUseCase.execute(testUser)

    const user_id = !createdUser.id ? 'Error' : createdUser.id

    expect(async () => {
      await getStatementOperationUseCase.execute({
          user_id,
          statement_id : 'nonexistent_statement'
        })
    }).rejects.toBeInstanceOf(AppError);
  })
})
