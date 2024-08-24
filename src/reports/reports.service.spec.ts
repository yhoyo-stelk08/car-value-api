import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './reports.entity';
import { ReportsService } from './reports.service';

// Mock report repository
const mockReportRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  remove: jest.fn(),
  findOneByOrFail: jest.fn(),
});
describe('ReportsService', () => {
  let service: ReportsService;
  let mockRepository: jest.Mocked<Repository<Report>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportRepository(),
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    mockRepository = module.get<Repository<Report>>(
      getRepositoryToken(Report),
    ) as jest.Mocked<Repository<Report>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new report', async () => {
    // Mock the report data
    const mockedReportData = {
      price: 150000,
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      mileage: 20000,
      lat: 34.0522,
      lng: -118.2437,
    } as Report;

    // Mock the repository methods
    mockRepository.create.mockReturnValue(mockedReportData); // mock the create method
    mockRepository.save.mockResolvedValue(mockedReportData); // mock the save method

    // Create a new report
    const report = await service.create(mockedReportData);

    // Assertions
    expect(mockRepository.create).toHaveBeenCalledWith(mockedReportData);
    expect(mockRepository.save).toHaveBeenCalledWith(mockedReportData);

    // Check if the report object has been created
    expect(mockRepository.create).toHaveBeenCalled();

    // Check if the report object has been saved
    expect(mockRepository.save).toHaveBeenCalled();

    // Check if the report object is returned
    expect(report).toEqual(mockedReportData);
  });
});
