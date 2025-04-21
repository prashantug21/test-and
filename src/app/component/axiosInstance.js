import Hls from "hls.js";

const HlsConfig = {
    debug: false,
    autoStartLoad: true,
    capLevelToPlayerSize: true,
    enableWorker: true,
    liveDurationInfinity: true,
    maxBufferLength: 30,
    maxBufferSize: 60 * 1000 * 1000, // 60MB
};

if (Hls.isSupported()) {
    console.log("HLS is supported in this browser.");
}
const hls = new Hls(HlsConfig);
hls.on(Hls.Events.ERROR, function (event, data) {
    if (data.fatal) {
        switch (data.fatal) {
            case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("A network error occurred while trying to load the video.");
                break;
            case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("A media error occurred while trying to load the video.");
                break;
            case Hls.ErrorTypes.OTHER_ERROR:
                console.error("An unknown error occurred.");
                break;
            default:
                console.error("An unknown error occurred.");
                break;
        }
    }
});
hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
    console.log("Manifest loaded, found " + data.levels.length + " quality level(s)");
});
export default hls;