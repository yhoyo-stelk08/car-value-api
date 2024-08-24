import { Test, TestingModule } from '@nestjs/testing';
import { CreateReportDto } from './dtos/create-report.dto';
import { UpdateReportDto } from './dtos/update-report.dto';
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

// mock the reports data
const mockReportsData = [
  {
    id: 1,
    price: 10000,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    mileage: 15000,
    lat: 34.0522,
    lng: -118.2437,
  },
  {
    id: 2,
    price: 20000,
    make: 'Toyota',
    model: 'Corolla',
    year: 2021,
    mileage: 20000,
    lat: 34.0522,
    lng: -118.2437,
  },
];

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportService: ReportsService;

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
    reportService = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have report service injected', async () => {
    expect(reportService).toBeDefined();
    expect(controller).toHaveProperty('reportService');
  });

  describe('create', () => {
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

      // expect the reportService.create method to have been called with the correct arguments
      expect(mockReportsService.create).toHaveBeenCalledWith(createReportDto);

      // expect the reportService.create method to have been called only once
      expect(mockReportsService.create).toHaveBeenCalledTimes(1);

      // ensure the result to be the same as the expected result
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if reportService.create() throws an error', async () => {
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

      // mock the reportService.create method to throw an error
      mockReportsService.create.mockRejectedValue(
        new Error('Unable to create and save report'),
      );

      // call the create method and expect an error to be thrown
      await expect(controller.create(createReportDto)).rejects.toThrow(
        'Unable to create and save report',
      );

      // expect the reportService.create method to have been called with the correct arguments
      expect(mockReportsService.create).toHaveBeenCalledWith(createReportDto);

      // expect the reportService.create method to have been called only once
      expect(mockReportsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should find all reports and return the reports array', async () => {
      // mock the resolve value of the findAll method
      mockReportsService.findAll.mockResolvedValue(mockReportsData);

      // call the findAll method
      const reports = await controller.findAll();

      // Assertions

      // expect the reportService.findAll method to have been called
      expect(mockReportsService.findAll).toHaveBeenCalled();

      // expect the reports array to be returned and equal to the mock data
      expect(reports).toEqual(mockReportsData);
    });

    it('should find all reports based on search category and return the reports array', async () => {
      // mock the search criteria
      const searchCriteria = { make: 'Toyota' };

      // mock the resolve value of the findAll method
      mockReportsService.findAll.mockResolvedValue([mockReportsData]);

      // call the findAll method
      const reports = await controller.findAll(searchCriteria);

      // Assertions

      // expect the reportService.findAll method to have been called with the correct arguments
      expect(mockReportsService.findAll).toHaveBeenCalledWith(searchCriteria);

      // expect the reports array to be returned and equal to the mock data
      expect(reports).toEqual([mockReportsData]);

      // expect the reportService.findAll method to have been called only once
      expect(mockReportsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no reports found', async () => {
      // mock the resolve value of the findAll method as an empty array
      mockReportsService.findAll.mockResolvedValue([]);

      // call the findAll method
      const reports = await controller.findAll();

      // Assertions

      // expect the reportService.findAll method to have been called
      expect(mockReportsService.findAll).toHaveBeenCalled();

      // expect the reports array to be returned as an empty array
      expect(reports).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a report by search criteria and return the report', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the resolve value of the findOne method
      mockReportsService.findOne.mockResolvedValue(mockReportsData[0]);

      // call the findOne method
      const report = await controller.findOne(searchCriteria);

      // Assertions

      // expect the reportService.findOne method to have been called with the correct arguments
      expect(mockReportsService.findOne).toHaveBeenCalledWith(searchCriteria);

      // expect the report to be returned and equal to the mock data
      expect(report).toEqual(mockReportsData[0]);
    });

    it('should throw an error if report not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 3 };

      // mock the reportService.findOne method to throw an error
      mockReportsService.findOne.mockRejectedValue(
        new Error('Report not found'),
      );

      // call the findOne method and expect an error to be thrown
      await expect(controller.findOne(searchCriteria)).rejects.toThrow(
        'Report not found',
      );

      // expect the reportService.findOne method to have been called with the correct arguments
      expect(mockReportsService.findOne).toHaveBeenCalledWith(searchCriteria);
    });
  });

  describe('update', () => {
    it('should update a report and return the updated report', async () => {
      const searchCriteria = { id: 1 };
      // mock the updated report data
      const updatedReportData: UpdateReportDto = {
        price: 15000,
      };

      // mock the resolve value of the update method
      mockReportsService.update.mockResolvedValue({
        ...mockReportsData[0],
        ...updatedReportData,
      });

      // call the update method
      const updatedReport = await controller.update(
        searchCriteria.id,
        updatedReportData,
      );

      // Assertions

      // expect the reportService.update method to have been called with the correct arguments
      expect(mockReportsService.update).toHaveBeenCalledWith(
        searchCriteria.id,
        updatedReportData,
      );

      // expect the updated report to be returned and equal to the mock data
      expect(updatedReport).toEqual({
        ...mockReportsData[0],
        ...updatedReportData,
      });

      // expect the reportService.update method to have been called only once
      expect(mockReportsService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if report not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 3 };

      // mock the reportService.update method to throw an error
      mockReportsService.update.mockRejectedValue(
        new Error('Report not found'),
      );

      // call the update method and expect an error to be thrown
      await expect(controller.update(searchCriteria.id, {})).rejects.toThrow(
        'Report not found',
      );

      // expect the reportService.update method to have been called with the correct arguments
      expect(mockReportsService.update).toHaveBeenCalledWith(
        searchCriteria.id,
        {},
      );

      // expect the reportService.update method to have been called only once
      expect(mockReportsService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a report and return the removed report', async () => {
      // mock the search criteria
      const searchCriteria = { id: 1 };

      // mock the resolve value of the remove method
      mockReportsService.remove.mockResolvedValue(mockReportsData[0]);

      // call the remove method
      const removedReport = await controller.remove(searchCriteria.id);

      // Assertions

      // expect the reportService.remove method to have been called with the correct arguments
      expect(mockReportsService.remove).toHaveBeenCalledWith(searchCriteria.id);

      // expect the removed report to be returned and equal to the mock data
      expect(removedReport).toEqual(mockReportsData[0]);

      // expect the reportService.remove method to have been called only once
      expect(mockReportsService.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if report not found', async () => {
      // mock the search criteria
      const searchCriteria = { id: 3 };

      // mock the reportService.remove method to throw an error
      mockReportsService.remove.mockRejectedValue(
        new Error('Report not found'),
      );

      // call the remove method and expect an error to be thrown
      await expect(controller.remove(searchCriteria.id)).rejects.toThrow(
        'Report not found',
      );

      // expect the reportService.remove method to have been called with the correct arguments
      expect(mockReportsService.remove).toHaveBeenCalledWith(searchCriteria.id);

      // expect the reportService.remove method to have been called only once
      expect(mockReportsService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
