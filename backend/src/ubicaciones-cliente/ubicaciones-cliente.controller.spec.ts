import { Test, TestingModule } from '@nestjs/testing';
import { UbicacionesClienteController } from './ubicaciones-cliente.controller';

describe('UbicacionesClienteController', () => {
  let controller: UbicacionesClienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UbicacionesClienteController],
    }).compile();

    controller = module.get<UbicacionesClienteController>(UbicacionesClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
