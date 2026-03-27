import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<IUser> {
    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(
      createUserDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('Email already registered');
    }

    return await this.usersRepository.create(createUserDto);
  }

  /**
   * Get all users
   */
  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.findAll();
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<IUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} does not exist`);
    }
    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<IUser> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} does not exist`);
    }
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    // Check if user exists
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} does not exist`);
    }

    // If email is changed, check if new email already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.emailExists(
        updateUserDto.email,
      );
      if (emailExists) {
        throw new BadRequestException('Email already registered');
      }
    }

    return await this.usersRepository.update(id, updateUserDto);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} does not exist`);
    }
  }
}
