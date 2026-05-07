import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<import("../users/entities/user.entity").User, "password_hash">;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: Omit<import("../users/entities/user.entity").User, "password_hash">;
    }>;
    getProfile(req: any): Promise<any>;
}
