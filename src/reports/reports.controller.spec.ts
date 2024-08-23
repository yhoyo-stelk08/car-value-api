import { Test, TestingModule } from '@nestjs/testing';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

// mock report service
const mockReportsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ReportsController', () => {
  let controller: ReportsController;
  let userService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    userService = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have report service injected', async () => {
    expect(userService).toBeDefined();
    expect(controller).toHaveProperty('reportService');
  });

  it('should call reportService.create() with the correct arguments', async () => {
    // mock create report dto
    const createReportDto: CreateReportDto = {
      price: 10000,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 15000,
      lat: 34.0522,
      lng: -118.2437,
    };

    const expectedResult = { id: 1, ...createReportDto };
    mockReportsService.create.mockResolvedValue(expectedResult);

    // call the create method
    const result = await controller.create(createReportDto);
    console.log(result);

    // expect the reportService.create method to have been called with the correct arguments
    expect(mockReportsService.create).toHaveBeenCalledWith(createReportDto);

    // expect the reportService.create method to have been called only once
    expect(mockReportsService.create).toHaveBeenCalledTimes(1);

    // ensure the result to be the same as the expected result
    expect(result).toEqual(expectedResult);
  });
});
