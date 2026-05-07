import CameraControls from '../components/controls/CameraControls';
import LiveCameraFeed from '../components/LiveCameraFeed';
import VerificationPanel from '../components/VerificationPanel';
import PhaseStepper from '../components/PhaseStepper'; // <-- ADD THIS IMPORT

export default function LiveMonitorView({
  isFullscreen, setIsFullscreen,
  streamStatus, setStreamStatus, streamToken, 
  handleStartCamera, handleStopCamera,
  locations, currentLocationId, setCurrentLocationId,
  hardwareIndex, setHardwareIndex, videoDevices,
  latestScan, cacheBuster
}) {
  return (
    <div className={`min-h-full lg:h-full flex flex-col gap-4 mx-auto animate-in fade-in duration-300 ${isFullscreen ? 'max-w-[100rem]' : 'max-w-7xl sm:gap-6'}`}>
      
      <CameraControls 
        streamStatus={streamStatus}
        onStart={handleStartCamera}
        onStop={handleStopCamera}
        locations={locations}
        currentLocationId={currentLocationId}
        onLocationChange={setCurrentLocationId}
        hardwareIndex={hardwareIndex}
        onHardwareIndexChange={setHardwareIndex}
        videoDevices={videoDevices} 
        isFullscreen={isFullscreen}
        toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-stretch justify-center gap-4 sm:gap-6 min-h-0 w-full">
        <div className="min-h-0 w-full flex justify-center items-center">
          <LiveCameraFeed 
            streamStatus={streamStatus}
            streamToken={streamToken}
            onRetry={handleStartCamera} 
            onStreamDrop={() => setStreamStatus("error")}
          />
        </div>

        {/* Change this wrapper to flex-col and gap-4 to stack the stepper and panel nicely */}
        <div className="min-h-0 w-full flex flex-col justify-center items-center gap-4">
          <PhaseStepper latestScan={latestScan} />
          <VerificationPanel latestScan={latestScan} cacheBuster={cacheBuster} />
        </div>
      </div>
      
    </div>
  );
}