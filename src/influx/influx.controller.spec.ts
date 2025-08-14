import { Test, TestingModule } from '@nestjs/testing';
import { InfluxController } from './influx.controller';
import { InfluxService } from './influx.service';

describe('InfluxController', () => {
  let controller: InfluxController;
  let influxService: InfluxService;

  const mockInfluxService = {
    createBucketForVivarium: jest.fn(),
    insertData: jest.fn(),
    getLatestData: jest.fn(),
    deleteBucketForVivarium: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfluxController],
      providers: [
        {
          provide: InfluxService,
          useValue: mockInfluxService,
        },
      ],
    }).compile();

    controller = module.get<InfluxController>(InfluxController);
    influxService = module.get<InfluxService>(InfluxService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBucket', () => {
    it('should create bucket successfully', async () => {
      const vivariumId = 1;

      mockInfluxService.createBucketForVivarium.mockResolvedValue(true);

      const result = await controller.createBucket(vivariumId);

      expect(influxService.createBucketForVivarium).toHaveBeenCalledWith(
        vivariumId,
      );
      expect(result).toBe(true);
    });

    it('should handle service errors', async () => {
      const vivariumId = 1;
      const mockError = new Error('Service error');

      mockInfluxService.createBucketForVivarium.mockRejectedValue(mockError);

      await expect(controller.createBucket(vivariumId)).rejects.toThrow(
        'Service error',
      );
      expect(influxService.createBucketForVivarium).toHaveBeenCalledWith(
        vivariumId,
      );
    });
  });

  describe('insertData', () => {
    const mockMeasurementDto = {
      vivariumId: 1,
      measurement: 'temperature',
      value: 25.5,
      tags: { sensor: 'temp1' },
    };

    it('should insert data successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Data inserted successfully',
      };

      mockInfluxService.insertData.mockResolvedValue(mockResponse);

      const result = await controller.insertData(mockMeasurementDto);

      expect(influxService.insertData).toHaveBeenCalledWith(
        mockMeasurementDto.vivariumId,
        mockMeasurementDto.measurement,
        mockMeasurementDto.value,
        mockMeasurementDto.tags,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Insert failed');

      mockInfluxService.insertData.mockRejectedValue(mockError);

      await expect(controller.insertData(mockMeasurementDto)).rejects.toThrow(
        'Insert failed',
      );
      expect(influxService.insertData).toHaveBeenCalledWith(
        mockMeasurementDto.vivariumId,
        mockMeasurementDto.measurement,
        mockMeasurementDto.value,
        mockMeasurementDto.tags,
      );
    });
  });

  describe('getData', () => {
    const mockQueryDto = {
      vivariumId: 1,
      measurement: 'temperature',
      timeRange: 24,
    };

    it('should get data successfully', async () => {
      const mockData = [
        { time: '2023-01-01T00:00:00Z', value: 25.5 },
        { time: '2023-01-01T01:00:00Z', value: 26.0 },
      ];

      mockInfluxService.getLatestData.mockResolvedValue(mockData);

      const result = await controller.getData(mockQueryDto);

      expect(influxService.getLatestData).toHaveBeenCalledWith(
        mockQueryDto.vivariumId,
        mockQueryDto.measurement,
        mockQueryDto.timeRange,
      );
      expect(result).toEqual(mockData);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Query failed');

      mockInfluxService.getLatestData.mockRejectedValue(mockError);

      await expect(controller.getData(mockQueryDto)).rejects.toThrow(
        'Query failed',
      );
      expect(influxService.getLatestData).toHaveBeenCalledWith(
        mockQueryDto.vivariumId,
        mockQueryDto.measurement,
        mockQueryDto.timeRange,
      );
    });
  });

  describe('deleteBucket', () => {
    it('should delete bucket successfully', async () => {
      const vivariumId = 1;

      mockInfluxService.deleteBucketForVivarium.mockResolvedValue(true);

      const result = await controller.deleteBucket(vivariumId);

      expect(influxService.deleteBucketForVivarium).toHaveBeenCalledWith(
        vivariumId,
      );
      expect(result).toBe(true);
    });

    it('should handle service errors', async () => {
      const vivariumId = 1;
      const mockError = new Error('Delete failed');

      mockInfluxService.deleteBucketForVivarium.mockRejectedValue(mockError);

      await expect(controller.deleteBucket(vivariumId)).rejects.toThrow(
        'Delete failed',
      );
      expect(influxService.deleteBucketForVivarium).toHaveBeenCalledWith(
        vivariumId,
      );
    });
  });
});
