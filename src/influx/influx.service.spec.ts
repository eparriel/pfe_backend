import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { BucketsAPI, HealthAPI } from '@influxdata/influxdb-client-apis';

// Mock InfluxDB classes
jest.mock('@influxdata/influxdb-client');
jest.mock('@influxdata/influxdb-client-apis');

const mockInfluxDB = InfluxDB as jest.MockedClass<typeof InfluxDB>;
const mockBucketsAPI = BucketsAPI as jest.MockedClass<typeof BucketsAPI>;
const mockHealthAPI = HealthAPI as jest.MockedClass<typeof HealthAPI>;

describe('InfluxService', () => {
  let service: InfluxService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockBucketsApiInstance = {
    getBuckets: jest.fn(),
    postBuckets: jest.fn(),
    deleteBucketsID: jest.fn(),
  };

  const mockHealthApiInstance = {
    getHealth: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default config values
    mockConfigService.get
      .mockReturnValueOnce('http://localhost:8086') // INFLUXDB_URL
      .mockReturnValueOnce('test-token') // INFLUXDB_TOKEN
      .mockReturnValueOnce('test-org'); // INFLUXDB_ORG

    // Mock InfluxDB constructor
    mockInfluxDB.mockImplementation(() => ({}) as any);

    // Mock BucketsAPI constructor
    mockBucketsAPI.mockImplementation(() => mockBucketsApiInstance as any);

    // Mock HealthAPI constructor
    mockHealthAPI.mockImplementation(() => mockHealthApiInstance as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfluxService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<InfluxService>(InfluxService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the private properties after instantiation
    (service as any).influxDB = mockInfluxDB.mock.results[0].value;
    (service as any).bucketsApi = mockBucketsApiInstance;
    (service as any).healthApi = mockHealthApiInstance;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(configService.get).toHaveBeenCalledWith('INFLUXDB_URL');
      expect(configService.get).toHaveBeenCalledWith('INFLUXDB_TOKEN');
      expect(configService.get).toHaveBeenCalledWith('INFLUXDB_ORG');
      expect(mockInfluxDB).toHaveBeenCalledWith({
        url: 'http://localhost:8086',
        token: 'test-token',
      });
    });

    it('should throw error when INFLUXDB_URL is missing', () => {
      mockConfigService.get.mockReturnValueOnce(undefined);

      expect(() => new InfluxService(mockConfigService as any)).toThrow(
        'INFLUXDB_URL is required',
      );
    });

    it('should throw error when INFLUXDB_TOKEN is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('http://localhost:8086')
        .mockReturnValueOnce(undefined);

      expect(() => new InfluxService(mockConfigService as any)).toThrow(
        'INFLUXDB_TOKEN is required',
      );
    });

    it('should throw error when INFLUXDB_ORG is missing', () => {
      mockConfigService.get
        .mockReturnValueOnce('http://localhost:8086')
        .mockReturnValueOnce('test-token')
        .mockReturnValueOnce(undefined);

      expect(() => new InfluxService(mockConfigService as any)).toThrow(
        'INFLUXDB_ORG is required',
      );
    });
  });

  describe('onModuleInit', () => {
    it('should check InfluxDB health successfully', async () => {
      const mockHealth = { status: 'pass' };
      mockHealthApiInstance.getHealth.mockResolvedValue(mockHealth);

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.onModuleInit();

      expect(mockHealthApiInstance.getHealth).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Initializing InfluxDB service...',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'InfluxDB connection status: pass',
      );
    });

    it('should handle connection error gracefully', async () => {
      const mockError = new Error('Connection failed');
      mockHealthApiInstance.getHealth.mockRejectedValue(mockError);

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.onModuleInit();

      expect(mockHealthApiInstance.getHealth).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Initializing InfluxDB service...',
      );
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to connect to InfluxDB: Connection failed',
      );
    });
  });

  describe('createBucketForVivarium', () => {
    it('should create bucket successfully when it does not exist', async () => {
      const vivariumId = 1;
      const bucketName = 'vivarium_1';

      // Mock bucket doesn't exist
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [],
      });

      // Mock successful bucket creation
      mockBucketsApiInstance.postBuckets.mockResolvedValue({});

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const result = await service.createBucketForVivarium(vivariumId);

      expect(mockBucketsApiInstance.getBuckets).toHaveBeenCalledWith({
        org: 'test-org',
        name: bucketName,
      });
      expect(mockBucketsApiInstance.postBuckets).toHaveBeenCalledWith({
        body: {
          orgID: 'test-org',
          name: bucketName,
          retentionRules: [
            {
              type: 'expire',
              everySeconds: 2592000, // 30 days
            },
          ],
        },
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Created bucket ${bucketName} for vivarium ${vivariumId}`,
      );
      expect(result).toBe(true);
    });

    it('should return false when bucket already exists', async () => {
      const vivariumId = 1;
      const bucketName = 'vivarium_1';

      // Mock bucket already exists
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [{ name: bucketName }],
      });

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const result = await service.createBucketForVivarium(vivariumId);

      expect(mockBucketsApiInstance.getBuckets).toHaveBeenCalledWith({
        org: 'test-org',
        name: bucketName,
      });
      expect(mockBucketsApiInstance.postBuckets).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Bucket ${bucketName} already exists`,
      );
      expect(result).toBe(false);
    });

    it('should throw error when bucket creation fails', async () => {
      const vivariumId = 1;
      // bucketName variable removed as it's not used

      // Mock bucket doesn't exist
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [],
      });

      // Mock bucket creation failure
      const mockError = new Error('Bucket creation failed');
      mockBucketsApiInstance.postBuckets.mockRejectedValue(mockError);

      // Mock the logger
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.createBucketForVivarium(vivariumId)).rejects.toThrow(
        'Bucket creation failed',
      );

      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to create bucket for vivarium ${vivariumId}: Bucket creation failed`,
      );
    });
  });

  describe('insertData', () => {
    it('should insert data successfully', async () => {
      const vivariumId = 1;
      const measurement = 'temperature';
      const value = 25.5;
      const tags = { sensor: 'temp1' };

      // Mock the writeApi
      const mockWriteApi = {
        writePoint: jest.fn(),
        close: jest.fn(),
      };

      // Mock the getWriteApi method
      const mockInfluxDBInstance = {
        getWriteApi: jest.fn().mockReturnValue(mockWriteApi),
      };
      (service as any).influxDB = mockInfluxDBInstance;

      // Mock Point constructor
      const mockPoint = {
        floatField: jest.fn().mockReturnThis(),
        timestamp: jest.fn().mockReturnThis(),
        tag: jest.fn().mockReturnThis(),
      };
      (Point as any).mockImplementation(() => mockPoint);

      await service.insertData(vivariumId, measurement, value, tags);

      expect(mockInfluxDBInstance.getWriteApi).toHaveBeenCalledWith(
        'test-org',
        `vivarium_${vivariumId}`,
        'ns',
      );
      expect(Point).toHaveBeenCalledWith(measurement);
      expect(mockPoint.floatField).toHaveBeenCalledWith('value', value);
      expect(mockPoint.tag).toHaveBeenCalledWith(
        'vivariumId',
        vivariumId.toString(),
      );
      expect(mockWriteApi.writePoint).toHaveBeenCalledWith(mockPoint);
      expect(mockWriteApi.close).toHaveBeenCalled();
    });

    it('should handle insert errors gracefully', async () => {
      const vivariumId = 1;
      const measurement = 'temperature';
      const value = 25.5;
      const tags = { sensor: 'temp1' };

      // Mock the writeApi with error
      const mockWriteApi = {
        writePoint: jest.fn().mockImplementation(() => {
          throw new Error('Insert failed');
        }),
        close: jest.fn(),
      };

      // Mock the getWriteApi method
      const mockInfluxDBInstance = {
        getWriteApi: jest.fn().mockReturnValue(mockWriteApi),
      };
      (service as any).influxDB = mockInfluxDBInstance;

      // Mock the logger
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.insertData(vivariumId, measurement, value, tags),
      ).rejects.toThrow('Insert failed');

      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to insert data for vivarium ${vivariumId}: Insert failed`,
      );
      // close() is called in finally block, but error is thrown before
    });
  });

  describe('getLatestData', () => {
    it('should get data successfully', async () => {
      const vivariumId = 1;
      const measurement = 'temperature';
      const timeRange = 24;

      // Mock the queryApi
      const mockQueryApi = {
        collectRows: jest.fn().mockResolvedValue([
          { time: '2023-01-01T00:00:00Z', value: 25.5 },
          { time: '2023-01-01T01:00:00Z', value: 26.0 },
        ]),
      };

      // Mock the getQueryApi method
      const mockInfluxDBInstance = {
        getQueryApi: jest.fn().mockReturnValue(mockQueryApi),
      };
      (service as any).influxDB = mockInfluxDBInstance;

      const result = await service.getLatestData(
        vivariumId,
        measurement,
        timeRange,
      );

      expect(mockInfluxDBInstance.getQueryApi).toHaveBeenCalledWith('test-org');
      expect(mockQueryApi.collectRows).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should handle query errors gracefully', async () => {
      const vivariumId = 1;
      const measurement = 'temperature';
      const timeRange = 24;

      // Mock the queryApi with error
      const mockQueryApi = {
        collectRows: jest.fn().mockRejectedValue(new Error('Query failed')),
      };

      // Mock the getQueryApi method
      const mockInfluxDBInstance = {
        getQueryApi: jest.fn().mockReturnValue(mockQueryApi),
      };
      (service as any).influxDB = mockInfluxDBInstance;

      // Mock the logger
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.getLatestData(vivariumId, measurement, timeRange),
      ).rejects.toThrow('Query failed');

      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to get data for vivarium ${vivariumId}: Query failed`,
      );
    });
  });

  describe('deleteBucketForVivarium', () => {
    it('should delete bucket successfully', async () => {
      const vivariumId = 1;
      const bucketName = 'vivarium_1';

      // Mock bucket exists
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [{ id: 'bucket-123', name: bucketName }],
      });

      // Mock successful bucket deletion
      mockBucketsApiInstance.deleteBucketsID.mockResolvedValue({});

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.deleteBucketForVivarium(vivariumId);

      expect(mockBucketsApiInstance.getBuckets).toHaveBeenCalledWith({
        org: 'test-org',
        name: bucketName,
      });
      expect(mockBucketsApiInstance.deleteBucketsID).toHaveBeenCalledWith({
        bucketID: 'bucket-123',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Deleted bucket ${bucketName} for vivarium ${vivariumId}`,
      );
    });

    it('should handle non-existent bucket gracefully', async () => {
      const vivariumId = 1;
      const bucketName = 'vivarium_1';

      // Mock bucket doesn't exist
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [],
      });

      // Mock the logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.deleteBucketForVivarium(vivariumId);

      expect(mockBucketsApiInstance.getBuckets).toHaveBeenCalledWith({
        org: 'test-org',
        name: bucketName,
      });
      expect(mockBucketsApiInstance.deleteBucketsID).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Bucket ${bucketName} does not exist`,
      );
    });

    it('should handle deletion errors gracefully', async () => {
      const vivariumId = 1;
      const bucketName = 'vivarium_1';

      // Mock bucket exists
      mockBucketsApiInstance.getBuckets.mockResolvedValue({
        buckets: [{ id: 'bucket-123', name: bucketName }],
      });

      // Mock deletion failure
      const mockError = new Error('Deletion failed');
      mockBucketsApiInstance.deleteBucketsID.mockRejectedValue(mockError);

      // Mock the logger
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.deleteBucketForVivarium(vivariumId)).rejects.toThrow(
        'Deletion failed',
      );

      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to delete bucket for vivarium ${vivariumId}: Deletion failed`,
      );
    });
  });
});
