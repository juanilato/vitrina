import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [EmailModule],
  providers: [VerificationService, PrismaService],
  exports: [VerificationService],
})
export class VerificationModule {}

