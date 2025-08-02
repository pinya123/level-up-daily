import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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

export class RefreshTokenDto {
  refreshToken: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, email, password, dayStartTime = '09:00:00' } = registerDto;
    const result = await this.authService.register(username, email, password, dayStartTime);
    
    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        totalPoints: result.user.totalPoints,
        currentStreak: result.user.currentStreak,
        maxStreak: result.user.maxStreak,
        dayStartTime: result.user.dayStartTime,
        lastLoginAt: result.user.lastLoginAt,
        createdAt: result.user.createdAt,
      },
      tokens: result.tokens,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    const result = await this.authService.login(username, password);
    
    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        totalPoints: result.user.totalPoints,
        currentStreak: result.user.currentStreak,
        maxStreak: result.user.maxStreak,
        dayStartTime: result.user.dayStartTime,
        lastLoginAt: result.user.lastLoginAt,
        createdAt: result.user.createdAt,
      },
      tokens: result.tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    await this.authService.changePassword(req.user.id, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
} 