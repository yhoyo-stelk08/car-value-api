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
    approved: false,
  };

  // mock the user object
  const mockedUserData = {
    id: 1,
    email: 'test@example.com',
    password: 'password',
  } as User;

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
    it('should create and return a new report with associated user', async () => {
      // Mock the user repository methods
      userRepository.findOne.mockResolvedValue(mockedUserData); // mock the findOne method

      // Mock the repository methods
      reportRepository.create.mockReturnValue(mockedReportData); // mock the create method
      reportRepository.save.mockResolvedValue(mockedReportData); // mock the save method

      // Create a new report
      const report = await service.create(mockedReportData, mockedUserData);

      // Assertions
      expect(reportRepository.create).toHaveBeenCalledWith(mockedReportData);
      expect(reportRepository.save).toHaveBeenCalledWith(mockedReportData);

      // Ensure that the report is associated with the correct user
      expect(report.user).toEqual(mockedUserData);

      // Check if the report object is returned
      expect(report).toEqual(mockedReportData);
    });

    it('should throw an error if the report object is not saved', async () => {
      // Mock the user repository methods
      userRepository.findOne.mockResolvedValue(mockedUserData); // mock the findOne method

      // Mock the repository methods
      reportRepository.create.mockReturnValue(mockedReportData); // mock the create method
      reportRepository.save.mockRejectedValue(
        new Error('Unable to create and save report'),
      ); // mock the save method

      // Assertions

      // expect the error is thrown
      await expect(
        service.create(mockedReportDto, mockedUserData),
      ).rejects.toThrow('Unable to create and save report');

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

  describe('approveReport', () => {
    it('should approve a report and return the approved report with the associated user', async () => {
      const approved = true;
      const reportWithUser = { ...mockedReportData, user: mockedUserData };

      // Mock the repository to find and save the report
      reportRepository.findOneByOrFail.mockResolvedValue(reportWithUser); // existing report
      reportRepository.save.mockResolvedValue(reportWithUser); // updated report

      // Call the approveReport method in the service
      const report = await service.approveReport(1, approved);

      // Assertions
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(reportRepository.save).toHaveBeenCalledWith(reportWithUser);
      expect(report.user).toEqual(mockedUserData);
      expect(report).toEqual(reportWithUser);
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
      await expect(service.approveReport(1, true)).rejects.toThrow(
        'Report not found',
      );

      // expect the findOneByOrFail method to be called with the search criteria
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
    });
  });

  describe('findAll', () => {
    it('should find all reports and return them with associated user', async () => {
      // Mock report data
      const mockedReportDataWithUser = {
        ...mockedReportData,
        user: mockedUserData,
      };
      // Mock the repository methods
      reportRepository.find.mockResolvedValue([mockedReportDataWithUser]);

      // mock the findAll method in service
      const reports = await service.findAll();

      // Assertions
      expect(reportRepository.find).toHaveBeenCalled(); // expect the find method to be called

      // Ensure that the report is associated with the correct user
      expect(reports[0].user).toEqual(mockedUserData);

      // Check if the reports array is returned
      expect(reports).toEqual([mockedReportDataWithUser]);
    });

    it('should find all reports based on search criteria and return them with the associated user', async () => {
      const searchCriteria = { make: 'Toyota' };

      // Mock the repository to return reports with associated users based on criteria
      const mockedReportWithUserData = {
        ...mockedReportData,
        user: mockedUserData,
      };
      reportRepository.findBy.mockResolvedValue([mockedReportWithUserData]);

      // Call the findAll method in the service with search criteria
      const reports = await service.findAll(searchCriteria);

      // Assertions
      expect(reportRepository.findBy).toHaveBeenCalledWith(searchCriteria);
      expect(reports[0].user).toEqual(mockedUserData);
      expect(reports).toEqual([mockedReportWithUserData]);
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
    it('should find a report based on search criteria and return it with the associated user', async () => {
      const searchCriteria = { id: 1 };

      // Mock the repository to return a report with an associated user
      const mockedReportWithUserData = {
        ...mockedReportData,
        user: mockedUserData,
      };
      reportRepository.findOneByOrFail.mockResolvedValue(
        mockedReportWithUserData,
      );

      // Call the findOne method in the service
      const report = await service.findOne(searchCriteria);

      // Assertions
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith(
        searchCriteria,
      );
      expect(report.user).toEqual(mockedUserData);
      expect(report).toEqual(mockedReportWithUserData);
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
    it('should update a report and return the updated report with the associated user', async () => {
      const updateData: UpdateReportDto = { price: 200000 };
      const updatedReport = {
        ...mockedReportData,
        ...updateData,
        user: mockedUserData,
      };

      // Mock the repository to find and save the report
      reportRepository.findOneByOrFail.mockResolvedValue(mockedReportData); // existing report
      reportRepository.save.mockResolvedValue(updatedReport); // updated report

      // Call the update method in the service
      const report = await service.update(1, updateData);

      // Assertions
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(reportRepository.save).toHaveBeenCalledWith(updatedReport);
      expect(report.user).toEqual(mockedUserData);
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
    it('should remove a report and return the removed report with the associated user', async () => {
      const reportWithUser = { ...mockedReportData, user: mockedUserData };

      // Mock the repository to find and remove the report
      reportRepository.findOneByOrFail.mockResolvedValue(reportWithUser);
      reportRepository.remove.mockResolvedValue(reportWithUser);

      // Call the remove method in the service
      const report = await service.remove(1);

      // Assertions
      expect(reportRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(reportRepository.remove).toHaveBeenCalledWith(reportWithUser);
      expect(report.user).toEqual(mockedUserData);
      expect(report).toEqual(reportWithUser);
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
