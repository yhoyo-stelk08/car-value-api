import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { Report } from './reports.entity';
import { ReportsService } from './reports.service';

// Mock report repository
const mockReportRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  findOneByOrFail: jest.fn(),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let mockRepository: jest.Mocked<Repository<Report>>;

  // Mock the create report dto
  const mockedReportDto: CreateReportDto = {
    price: 150000,
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
    mileage: 20000,
    lat: 34.0522,
    lng: -118.2437,
  };

  // mock the report object
  const mockedReportData = {
    id: 1,
    ...mockedReportDto,
  } as Report;

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

  // clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new report', async () => {
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

    it('should throw an error if the report object is not saved', async () => {
      // Mock the repository methods
      mockRepository.create.mockReturnValue(mockedReportData); // mock the create method
      mockRepository.save.mockRejectedValue(new Error('Database error')); // mock the save method

      // Assertions

      // expect the create method to be called with the mocked report dto
      expect(mockRepository.create).toHaveBeenCalledWith(mockedReportDto);

      // expect the save method to be called with the mocked report data
      expect(mockRepository.save).toHaveBeenCalledWith(mockedReportData);

      // expect the error is thrown
      await expect(service.create(mockedReportDto)).rejects.toThrow(
        'Database error',
      );
    });

    // it('should throw an error if the report object is not created', async () => {
    //   // mock the repository methods
    //   mockRepository.create.mockRejectedValue(new Error('Database error')); // mock the create method
    // });
  });

  describe('findAll', () => {
    it('should find all reports', async () => {
      // Mock the repository methods
      mockRepository.find.mockResolvedValue([mockedReportData]); // mock the find method

      // mock the findAll method in service
      const reports = await service.findAll();

      // Assertions
      expect(mockRepository.find).toHaveBeenCalled();

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportData]);
    });
  });

  describe('findOne', () => {
    it('should find a report based on search criteria', async () => {});
  });

  describe('update', () => {
    it('should update a report', async () => {});
  });

  describe('remove', () => {
    it('should remove a report', async () => {});
  });
});
