import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already registered or invalid data',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Body() body: { refreshToken: string },
  ): Promise<{ accessToken: string }> {
    return await this.authService.refreshAccessToken(body.refreshToken);
  }
}
