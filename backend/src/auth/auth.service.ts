import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreate42UserInDatabase(login42: string): Promise<User> {
    return await this.usersService.createUser({ login42 });
  }

  issueJwtToken(login42: string): string {
    const payload = { login42 };
    return this.jwtService.sign(payload);
    // this sign() function comes from the @nestjs/jwt library
  }
}