import { Test, TestingModule } from '@nestjs/testing';
import { UbicacionesClienteService } from './ubicaciones-cliente.service';

describe('UbicacionesClienteService', () => {
  let service: UbicacionesClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UbicacionesClienteService],
    }).compile();

    service = module.get<UbicacionesClienteService>(UbicacionesClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
