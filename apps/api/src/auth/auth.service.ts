import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<{ email: string }> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { email: admin.email };
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: { email: string } }> {
    const user = await this.validateAdmin(email, password);
    const accessToken = await this.jwt.signAsync({ email: user.email });
    return { accessToken, user };
  }

  async verify(token: string): Promise<{ email: string }> {
    return this.jwt.verifyAsync<{ email: string }>(token);
  }
}
