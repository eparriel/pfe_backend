import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new ForbiddenException('Access denied');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only administrators can access this resource',
      );
    }

    return user;
  }
}
