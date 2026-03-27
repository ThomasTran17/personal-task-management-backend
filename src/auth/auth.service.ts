import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto, UserDto } from './dtos/auth-response.dto';
import { IJwtPayload } from './interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email already exists
    try {
      await this.usersService.findByEmail(registerDto.email);
      throw new BadRequestException('Email already registered');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Email doesn't exist, continue with registration
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    const userDto = this.mapUserToDto(user);

    return {
      ...tokens,
      user: userDto,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    const userDto = this.mapUserToDto(user);

    return {
      ...tokens,
      user: userDto,
    };
  }

  /**
   * Validate JWT token and return user
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.id);

      const newAccessToken = this.jwtService.sign(
        { id: user.id, email: user.email } as IJwtPayload,
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Map user to DTO (exclude password)
   */
  private mapUserToDto(user: any): UserDto {
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.email = user.email;
    userDto.firstName = user.firstName;
    userDto.lastName = user.lastName;
    userDto.avatar = user.avatar;
    userDto.createdAt = user.createdAt;
    return userDto;
  }
}
