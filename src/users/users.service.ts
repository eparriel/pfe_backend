import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Vérifier que l'utilisateur modifie son propre profil
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const data: any = { ...updateUserDto };

    // Hacher le mot de passe si fourni
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Mettre à jour le nom d'affichage si prénom ou nom a changé
    if (updateUserDto.firstName || updateUserDto.lastName) {
      const firstName = updateUserDto.firstName || user.firstName;
      const lastName = updateUserDto.lastName || user.lastName;
      data.name = `${firstName} ${lastName}`;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    const { password: _password, ...result } = updatedUser;
    return result;
  }

  async remove(id: number, currentUserId: number, isAdmin: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Vérifier si l'utilisateur supprime son propre compte ou s'il est admin
    if (id !== currentUserId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own account unless you are an admin');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
} 