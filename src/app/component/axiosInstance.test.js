// File: hls.test.js

// Mock hls.js
jest.mock('hls.js', () => {
    const mockHls = {
        Events: {
            ERROR: 'hlsError',
            MANIFEST_PARSED: 'manifestParsed'
        },
        ErrorTypes: {
            NETWORK_ERROR: 'networkError',
            MEDIA_ERROR: 'mediaError',
            OTHER_ERROR: 'otherError'
        },
        on: jest.fn(),
        isSupported: jest.fn().mockReturnValue(true)
    };

    const MockHlsConstructor = jest.fn().mockImplementation(() => mockHls);
    MockHlsConstructor.Events = mockHls.Events;
    MockHlsConstructor.ErrorTypes = mockHls.ErrorTypes;
    MockHlsConstructor.isSupported = mockHls.isSupported;

    return MockHlsConstructor;
});

// Import the actual HLS instance from your file
import hls from './axiosInstance'; // Adjust path as needed
import Hls from 'hls.js';

describe('HLS Player', () => {
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    test('should check if HLS is supported', () => {
        expect(Hls.isSupported).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('HLS is supported in this browser.');
    });

    test('should initialize with correct configuration', () => {
        const expectedConfig = {
            debug: false,
            autoStartLoad: true,
            capLevelToPlayerSize: true,
            enableWorker: true,
            liveDurationInfinity: true,
            maxBufferLength: 30,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
        };

        expect(Hls).toHaveBeenCalledWith(expectedConfig);
    });

    test('should register error event handler', () => {
        // Check if .on method was called with the ERROR event
        expect(Hls.mock.results[0].value.on).toHaveBeenCalledWith(
            Hls.Events.ERROR,
            expect.any(Function)
        );
    });

    test('should register manifest parsed event handler', () => {
        // Check if .on method was called with the MANIFEST_PARSED event
        expect(Hls.mock.results[0].value.on).toHaveBeenCalledWith(
            Hls.Events.MANIFEST_PARSED,
            expect.any(Function)
        );
    });

    test('should handle errors correctly', () => {
        // Get the error handler function that was registered
        const errorHandlerCall = Hls.mock.results[0].value.on.mock.calls.find(
            call => call[0] === Hls.Events.ERROR
        );
        const errorHandler = errorHandlerCall[1];

        // Test network error
        errorHandler('event', { fatal: Hls.ErrorTypes.NETWORK_ERROR });
        expect(consoleErrorSpy).toHaveBeenCalledWith('A network error occurred while trying to load the video.');
        consoleErrorSpy.mockClear();

        // Test media error
        errorHandler('event', { fatal: Hls.ErrorTypes.MEDIA_ERROR });
        expect(consoleErrorSpy).toHaveBeenCalledWith('A media error occurred while trying to load the video.');
        consoleErrorSpy.mockClear();

        // Test other error
        errorHandler('event', { fatal: Hls.ErrorTypes.OTHER_ERROR });
        expect(consoleErrorSpy).toHaveBeenCalledWith('An unknown error occurred.');
        consoleErrorSpy.mockClear();

        // Test default case
        errorHandler('event', { fatal: 'someUnknownErrorType' });
        expect(consoleErrorSpy).toHaveBeenCalledWith('An unknown error occurred.');
        consoleErrorSpy.mockClear();

        // Test non-fatal error (should not log anything)
        errorHandler('event', { fatal: false });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should handle manifest parsed event correctly', () => {
        // Get the manifest parsed handler function that was registered
        const manifestHandlerCall = Hls.mock.results[0].value.on.mock.calls.find(
            call => call[0] === Hls.Events.MANIFEST_PARSED
        );
        const manifestHandler = manifestHandlerCall[1];

        // Test manifest parsed event
        const mockData = { levels: [1, 2, 3] }; // Mock 3 quality levels
        manifestHandler('event', mockData);
        expect(consoleLogSpy).toHaveBeenCalledWith('Manifest loaded, found 3 quality level(s)');
    });

    test('should handle case when HLS is not supported', () => {
        // Reset the mock to return false for isSupported
        jest.clearAllMocks();
        Hls.isSupported.mockReturnValueOnce(false);

        // Re-import the module to trigger the code again
        jest.resetModules();
        require('./axiosInstance'); // Adjust path as needed

        // Check that the console.log was not called with the support message
        expect(consoleLogSpy).not.toHaveBeenCalledWith('HLS is supported in this browser.');

        // Check that Hls constructor was still called (this may vary depending on your actual implementation)
        expect(Hls).toHaveBeenCalled();
    });
});