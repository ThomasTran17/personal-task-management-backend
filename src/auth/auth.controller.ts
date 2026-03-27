import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto, RefreshAccessTokenDto } from './dtos/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    description: 'User registered successfully. Refresh token set in HttpOnly cookie.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already registered or invalid data',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, cookieOptions, refreshToken } =
      await this.authService.register(registerDto);

    // Set refresh token in HttpOnly cookie
    response.cookie('refreshToken', refreshToken, cookieOptions);

    return authResponse;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully. Refresh token set in HttpOnly cookie.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, cookieOptions, refreshToken } =
      await this.authService.login(loginDto);

    // Set refresh token in HttpOnly cookie
    response.cookie('refreshToken', refreshToken, cookieOptions);

    return authResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses the refresh token stored in HttpOnly cookie to generate a new access token',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    type: RefreshAccessTokenDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing refresh token',
  })
  async refreshAccessToken(
    @Req() request: Request,
  ): Promise<RefreshAccessTokenDto> {
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new Error('Refresh token not found in cookies');
    }

    return await this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  async logout(@Res({ passthrough: true }) response: Response): Promise<{ message: string }> {
    // Clear refresh token cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    return { message: 'Logged out successfully' };
  }
}
