import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Tạo user mới
   */
  async create(createUserDto: CreateUserDto): Promise<IUser> {
    // Kiểm tra email đã tồn tại
    const emailExists = await this.usersRepository.emailExists(createUserDto.email);
    if (emailExists) {
      throw new BadRequestException('Email đã được đăng ký');
    }

    return await this.usersRepository.create(createUserDto);
  }

  /**
   * Lấy tất cả users
   */
  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.findAll();
  }

  /**
   * Lấy user theo ID
   */
  async findOne(id: string): Promise<IUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    return user;
  }

  /**
   * Lấy user theo email
   */
  async findByEmail(email: string): Promise<IUser> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User với email ${email} không tồn tại`);
    }
    return user;
  }

  /**
   * Cập nhật user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    // Kiểm tra user có tồn tại
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Nếu thay đổi email, kiểm tra email mới có tồn tại
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.emailExists(updateUserDto.email);
      if (emailExists) {
        throw new BadRequestException('Email đã được đăng ký');
      }
    }

    return await this.usersRepository.update(id, updateUserDto);
  }

  /**
   * Xóa user
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
  }
}