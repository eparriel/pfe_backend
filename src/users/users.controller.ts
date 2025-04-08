import { Controller, Body, Param, Put, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Vérifier si l'utilisateur est admin
    const isAdmin = req.user.role === 'admin';
    return this.usersService.remove(id, req.user.id, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.id, updateUserDto, req.user.id);
  }
} 