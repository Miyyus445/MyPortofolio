import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
  }

  async validateAdmin(email: string, password: string): Promise<{ email: string }> {
    const adminEmail = process.env.ADMIN_EMAIL ?? '';
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';
    if (!adminEmail || !adminPassword) throw new UnauthorizedException('Invalid credentials');
    if (email !== adminEmail) throw new UnauthorizedException('Invalid credentials');
    const ok = this.isBcryptHash(adminPassword)
      ? await bcrypt.compare(password, adminPassword)
      : password === adminPassword;
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { email: adminEmail };
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
