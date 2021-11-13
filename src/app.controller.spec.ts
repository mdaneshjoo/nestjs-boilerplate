import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// @ts-ignore
describe('AppController', () => {
  let appController: AppController;

  // @ts-ignore
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // @ts-ignore
  describe('root', () => {
    // @ts-ignore
    it('should return "Hello World!"', () => {
      // @ts-ignore
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
