import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<User, 'password_hash'>;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: Omit<User, 'password_hash'>;
    }>;
    validateUser(userId: number): Promise<User | null>;
}
