import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsNumber()
  skill_level?: number;

  @IsOptional()
  @IsArray()
  sport_preferences?: string[];
}