import { User } from '@/users/users.entity';
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

// mock user repository
const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let reportRepository: jest.Mocked<Repository<Report>>;
  let userRepository: jest.Mocked<Repository<User>>;

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

  // mock the user object
  const mockedUserData = {
    id: 1,
    email: 'test@example.com',
    password: 'password',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportRepository = module.get<Repository<Report>>(
      getRepositoryToken(Report),
    ) as jest.Mocked<Repository<Report>>;
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  // clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject the report repository', () => {
    expect(reportRepository).toBeDefined();
    expect(service).toHaveProperty('repo');
  });

  describe('create', () => {
    it('should create and return a new report', async () => {
      // Mock the repository methods
      reportRepository.create.mockReturnValue(mockedReportData); // mock the create method
      reportRepository.save.mockResolvedValue(mockedReportData); // mock the save method

      // Create a new report
      const report = await service.create(mockedReportData);

      // Assertions
      expect(reportRepository.create).toHaveBeenCalledWith(mockedReportData);
      expect(reportRepository.save).toHaveBeenCalledWith(mockedReportData);

      // Check if the report object has been created
      expect(reportRepository.create).toHaveBeenCalled();

      // Check if the report object has been saved
      expect(reportRepository.save).toHaveBeenCalled();

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report object is not saved', async () => {
      // Mock the repository methods
      reportRepository.create.mockReturnValue(mockedReportData); // mock the create method
      reportRepository.save.mockRejectedValue(
        new Error('Unable to create and save report'),
      ); // mock the save method

      // Assertions

      // expect the error is thrown
      await expect(service.create(mockedReportDto)).rejects.toThrow(
        'Unable to create and save report',
      );

      // expect the create method to be called with the mocked report dto
      expect(reportRepository.create).toHaveBeenCalledWith(mockedReportDto);

      // expect the save method to be called with the mocked report data
      expect(reportRepository.save).toHaveBeenCalledWith(mockedReportData);
    });

    // it('should throw an error if the report object is not created', async () => {
    //   // mock the repository methods
    //   reportRepository.create.mockRejectedValue(new Error('Database error')); // mock the create method
    // });
  });

  describe('findAll', () => {
    it('should find all reports', async () => {
      // Mock the repository methods
      reportRepository.find.mockResolvedValue([mockedReportData]);

      // mock the findAll method in service
      const reports = await service.findAll();

      // Assertions
      expect(reportRepository.find).toHaveBeenCalled();

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportData]);
    });

    it('should find all reports based on search criteria and return an array of reports object', async () => {
      // mock the search criteria
      const searchCriteria = { make: 'Toyota' };

      // Mock the repository methods
      reportRepository.findBy.mockResolvedValue([mockedReportData]); // mock the findBy method

      // mock the findAll method in service
      const reports = await service.findAll(searchCriteria);

      // Assertions

      // expect the findBy method to be called with the search criteria
      expect(reportRepository.findBy).toHaveBeenCalledWith(searchCriteria);

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportData]);
    });

    it('should return an empty array when no reports are found', async () => {
      // mock the repository methods
      reportRepository.find.mockResolvedValue([]); // mock the find method

      const result = await service.findAll();

      // Assertions
      expect(reportRepository.find).toHaveBeenCalled(); // expect the find method to be called
      expect(result).toEqual([]); // expect the result to be an empty array []
    });
  });

  describe('findOne', () => {
    it('should find a report based on search criteria', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // Mock the repository methods
      reportRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method

      // mock the findOne method in service
      const report = await service.findOne(searchCriteria);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the repository methods
      reportRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateData: UpdateReportDto = { price: 200000 };
      const updatedReport: Report = { ...mockedReportData, ...updateData };

      // Mock the repository methods
      reportRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method
      reportRepository.save.mockResolvedValue(updatedReport); // mock the save method

      // mock the update method in service
      const report = await service.update(1, updateData);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });

      // expect the save method to be called with the updated report data
      expect(reportRepository.save).toHaveBeenCalledWith(updatedReport);

      // Check if the report object is returned
      expect(report).toEqual(updatedReport);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { price: 200000 };

      // mock the repository methods
      reportRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });

  describe('remove', () => {
    it('should remove a report', async () => {
      // Mock the repository methods
      reportRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // mock the findOneByOrFail method
      reportRepository.remove.mockResolvedValue(mockedReportData); // mock the remove method

      // mock the remove method in service
      const report = await service.remove(1);

      // Assertions

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });

      // expect the remove method to be called with the report data
      expect(reportRepository.remove).toHaveBeenCalledWith(mockedReportData);

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report is not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the repository methods
      reportRepository.findOneByOrFail.mockRejectedValue(
        new NotFoundException('Report not found'),
      ); // mock the findOneByOrFail method

      // Assertions

      // expect the error is thrown
      await expect(service.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });
});
