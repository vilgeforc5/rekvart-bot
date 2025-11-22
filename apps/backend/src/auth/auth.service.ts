import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { LoginDto, LoginResponse } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const validLogin = process.env.AUTH_LOGIN;
    const validPassword = process.env.AUTH_PASSWORD;

    if (!validLogin || !validPassword) {
      throw new Error('AUTH_LOGIN and AUTH_PASSWORD must be set in .env');
    }

    if (loginDto.login !== validLogin || loginDto.password !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { login: loginDto.login };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(login: string): Promise<{ login: string } | null> {
    if (login === process.env.AUTH_LOGIN) {
      return { login };
    }
    return null;
  }
}
