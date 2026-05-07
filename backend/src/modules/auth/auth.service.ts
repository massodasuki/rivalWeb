import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: Omit<User, 'password_hash'> }> {
    const { password, ...rest } = registerDto;

    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      ...rest,
      password_hash: hashedPassword,
    });
    await this.usersRepository.save(user);
    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password_hash, ...safeUser } = user;
    return { access_token, user: safeUser };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password_hash'> }> {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password_hash, ...safeUser } = user;
    return { access_token, user: safeUser };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
