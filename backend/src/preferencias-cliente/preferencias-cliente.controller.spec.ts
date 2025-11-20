import { Test, TestingModule } from '@nestjs/testing';
import { PreferenciasClienteController } from './preferencias-cliente.controller';

describe('PreferenciasClienteController', () => {
  let controller: PreferenciasClienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferenciasClienteController],
    }).compile();

    controller = module.get<PreferenciasClienteController>(PreferenciasClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
