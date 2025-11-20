import { Test, TestingModule } from '@nestjs/testing';
import { PreferenciasClienteService } from './preferencias-cliente.service';

describe('PreferenciasClienteService', () => {
  let service: PreferenciasClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreferenciasClienteService],
    }).compile();

    service = module.get<PreferenciasClienteService>(PreferenciasClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
