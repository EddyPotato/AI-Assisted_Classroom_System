import LocationSelector from './LocationSelector';
import HardwareSelector from './HardwareSelector';
import ActionButtons from './ActionButtons';

export default function CameraControls({ 
  streamStatus, 
  onStart, 
  onStop, 
  locations, 
  currentLocationId, 
  onLocationChange,
  hardwareIndex,
  onHardwareIndexChange,
  videoDevices,
  isFullscreen,
  toggleFullscreen
}) {
  return (
    <div className="bg-white border-slate-200 border rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3 sm:gap-4 shrink-0 relative transition-colors duration-300">
      
      <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto flex-1 min-w-0">
        <LocationSelector 
          locations={locations} 
          currentLocationId={currentLocationId} 
          onLocationChange={onLocationChange} 
          isFullscreen={isFullscreen} 
        />
        
        <HardwareSelector 
          videoDevices={videoDevices} 
          hardwareIndex={hardwareIndex} 
          onHardwareIndexChange={onHardwareIndexChange} 
          isFullscreen={isFullscreen} 
        />
      </div>

      <ActionButtons 
        streamStatus={streamStatus} 
        onStart={onStart} 
        onStop={onStop} 
        isFullscreen={isFullscreen} 
        toggleFullscreen={toggleFullscreen} 
      />
      
    </div>
  );
}