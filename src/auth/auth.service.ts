import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name,
      role: user.role.name,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Créer le nom d'affichage à partir des prénom et nom
    const name = `${registerDto.firstName} ${registerDto.lastName}`;

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // S'assurer que le rôle "user" existe
    let userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    // Créer le rôle s'il n'existe pas
    if (!userRole) {
      userRole = await this.prisma.role.create({
        data: { name: 'user' },
      });
    }

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        name,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    const { password: _password, ...result } = user;

    // Générer le token JWT
    const payload = { 
      sub: result.id, 
      email: result.email,
      name: result.name,
      role: result.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role.name,
      },
    };
  }
} 