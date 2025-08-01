import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
  username: string;
  email: string;
  password: string;
  dayStartTime?: string;
}

export class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { user, token } = await this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
      registerDto.dayStartTime,
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        dayStartTime: user.dayStartTime,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
      },
      token,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { user, token } = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        dayStartTime: user.dayStartTime,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
      },
      token,
    };
  }
} 