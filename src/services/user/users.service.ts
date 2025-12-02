import { user } from "@jumpapay/jumpapay-models";
import { Transaction } from "objection";

type CreateUserInput = Pick<
  user.Users,
  "name" | "username" | "password" | "role" | "phone"
> & 
Partial<Pick<
    user.Users,
    "is_active" | "alias" | "avatar" | "about" | "is_reviewer" | "is_multi_device"
>>;

export class UsersService {

  async create(data: CreateUserInput, trx?: Transaction): Promise<user.Users> {
    const phoneExists = await user.Users.query(trx)
      .where("phone", data.phone!) 
      .whereNull("deleted_at")
      .first();
      
    if (phoneExists) {
        return phoneExists;
        // throw new BadRequestError(`User with phone ${data.phone} already exists.`);
    }

    const newUser = await user.Users.query(trx).insert(data).returning("*");
    return newUser;
  }
}

export default new UsersService();