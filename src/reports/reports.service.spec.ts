import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { UpdateReportDto } from './dtos/update-report.dto';
import { Report } from './reports.entity';
import { ReportsService } from './reports.service';

// Mock report repository
const mockReportRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findBy: jest.fn(),
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

  it('should inject the report repository', () => {
    expect(mockRepository).toBeDefined();
    expect(service).toHaveProperty('repo');
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
      mockRepository.save.mockRejectedValue(
        new Error('Unable to create and save report'),
      ); // mock the save method

      // Assertions

      // expect the error is thrown
      await expect(service.create(mockedReportDto)).rejects.toThrow(
        'Unable to create and save report',
      );

      // expect the create method to be called with the mocked report dto
      expect(mockRepository.create).toHaveBeenCalledWith(mockedReportDto);

      // expect the save method to be called with the mocked report data
      expect(mockRepository.save).toHaveBeenCalledWith(mockedReportData);
    });

    // it('should throw an error if the report object is not created', async () => {
    //   // mock the repository methods
    //   mockRepository.create.mockRejectedValue(new Error('Database error')); // mock the create method
    // });
  });

  describe('findAll', () => {
    it('should find all reports', async () => {
      // Mock the repository methods
      mockRepository.find.mockResolvedValue([mockedReportData]);

      // mock the findAll method in service
      const reports = await service.findAll();

      // Assertions
      expect(mockRepository.find).toHaveBeenCalled();

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportData]);
    });

    it('should find all reports based on search criteria and return an array of reports object', async () => {
      // mock the search criteria
      const searchCriteria = { make: 'Toyota' };

      // Mock the repository methods
      mockRepository.findBy.mockResolvedValue([mockedReportData]); // mock the findBy method

      // mock the findAll method in service
      const reports = await service.findAll(searchCriteria);

      // Assertions

      // expect the findBy method to be called with the search criteria
      expect(mockRepository.findBy).toHaveBeenCalledWith(searchCriteria);

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportData]);
    });

    it('should return an empty array when no reports are found', async () => {
      // mock the repository methods
      mockRepository.find.mockResolvedValue([]); // mock the find method

      const result = await service.findAll();

      // Assertions
      expect(mockRepository.find).toHaveBeenCalled(); // expect the find method to be called
      expect(result).toEqual([]); // expect the result to be an empty array []
    });
  });

  describe('findOne', () => {
    it('should find a report based on search criteria', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // Mock the repository methods
      mockRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method

      // mock the findOne method in service
      const report = await service.findOne(searchCriteria);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the repository methods
      mockRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateData: UpdateReportDto = { price: 200000 };
      const updatedReport: Report = { ...mockedReportData, ...updateData };

      // Mock the repository methods
      mockRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method
      mockRepository.save.mockResolvedValue(updatedReport); // mock the save method

      // mock the update method in service
      const report = await service.update(1, updateData);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });

      // expect the save method to be called with the updated report data
      expect(mockRepository.save).toHaveBeenCalledWith(updatedReport);

      // Check if the report object is returned
      expect(report).toEqual(updatedReport);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { price: 200000 };

      // mock the repository methods
      mockRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });

  describe('remove', () => {
    it('should remove a report', async () => {
      // Mock the repository methods
      mockRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method
      mockRepository.remove.mockResolvedValue(mockedReportData); // mock the remove method

      // mock the remove method in service
      const report = await service.remove(1);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });

      // expect the remove method to be called with the report data
      expect(mockRepository.remove).toHaveBeenCalledWith(mockedReportData);

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the repository methods
      mockRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });
});
