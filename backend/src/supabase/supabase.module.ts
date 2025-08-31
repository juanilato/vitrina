// src/supabase/supabase.module.ts
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // para usarlo en otros módulos
})
export class SupabaseModule {}
