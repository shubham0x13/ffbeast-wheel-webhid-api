export interface FirmwareVersion {
  releaseType: number;
  /** Year of the release. */
  major: number;
  /** Minor version (incremented when companion app update is needed). */
  minor: number;
  /** Patch version (incremented on each patch within the same version). */
  patch: number;
}

export interface FirmwareLicense {
  firmwareVersion: FirmwareVersion;
  /** Serial key components (3 x 32-bit values). */
  serialKey: number[];
  /** Device ID components (3 x 32-bit values). */
  deviceId: number[];
  /** Registration status (0 = unregistered, 1 = registered). */
  isRegistered: number;
}

export interface EffectSettings {
  /** Motion range in degrees. */
  motionRange: number;
  /** Static dampening strength (0 to 100%). */
  staticDampeningStrength: number;
  /** Soft stop dampening strength (0 to 100%). */
  softStopDampeningStrength: number;
  /** Total effect strength (0 to 100%). */
  totalEffectStrength: number;
  /** Integrated spring strength (0 to 100%). */
  integratedSpringStrength: number;
  /** Soft stop range in degrees (added on top of MotionRange). */
  softStopRange: number;
  /** Soft stop strength (0 to 100%). */
  softStopStrength: number;
  /** DirectX constant force direction (-1 or +1). */
  directXConstantDirection: number;
  /** DirectX spring strength (0 to 100%). */
  directXSpringStrength: number;
  /** DirectX constant strength (0 to 100%). */
  directXConstantStrength: number;
  /** DirectX periodic strength (0 to 100%). */
  directXPeriodicStrength: number;
}

export interface HardwareSettings {
  /** Encoder counts per revolution (CPR). */
  encoderCPR: number;
  /** Integral gain (I-Gain) for PID. */
  integralGain: number;
  /** Proportional gain (P-Gain) for PID. */
  proportionalGain: number;
  /** Force feedback enabled (0 = Disabled, 1 = Enabled). */
  forceEnabled: number;
  /** Debug torque output enabled (0 = Disabled, 1 = Enabled). */
  debugTorque: number;
  /** Amplifier gain setting. @see {@link AmplifierGain} */
  amplifierGain: number;
  /** Calibration magnitude (0 to 100%). */
  calibrationMagnitude: number;
  /** Calibration speed (0 to 100%). */
  calibrationSpeed: number;
  /** Power limit (0 to 100%). */
  powerLimit: number;
  /** Braking limit (0 to 100%). */
  brakingLimit: number;
  /** Position smoothing (0 to 100%). */
  positionSmoothing: number;
  /** Speed buffer size. */
  speedBufferSize: number;
  /** Encoder direction multiplier (-1 or +1). */
  encoderDirection: number;
  /** Force direction multiplier (-1 or +1). */
  forceDirection: number;
  /** Number of motor pole pairs. */
  polePairs: number;
}

export interface AdcSettings {
  /** Minimum raw values for the 3 analog axes. */
  rAxisMin: number[];
  /** Maximum raw values for the 3 analog axes. */
  rAxisMax: number[];
  /** Axis smoothing factor.
   * @remarks Divide by 100 to get normalized ratio (0..1).
   */
  rAxisSmoothing: number[];
  /** Point in % where "Button Low" is triggered.
   * @remarks 0 = Disabled.
   */
  rAxisToButtonLow: number[];
  /** Point in % where "Button High" is triggered.
   * @remarks 100 = Disabled.
   */
  rAxisToButtonHigh: number[];
  /** Axis inversion flags (0 or 1). */
  rAxisInvert: number[];
}

export interface GpioSettings {
  /** Extension mode. @see {@link ExtensionMode} */
  extensionMode: number;
  /** Pin mode configuration for 10 pins. @see {@link PinMode} */
  pinMode: number[];
  /** Button mode configuration for 32 buttons. @see {@link ButtonMode} */
  buttonMode: number[];
  /** SPI communication mode. @see {@link SpiMode} */
  spiMode: number;
  /** SPI latch mode. @see {@link SpiLatchMode} */
  spiLatchMode: number;
  /** SPI latch delay in microseconds. */
  spiLatchDelay: number;
  /** SPI clock pulse length in microseconds. */
  spiClkPulseLength: number;
}

/**
 * Direct control forces applied to the wheel.
 * @remarks All force values are normalized range (-10000 to +10000).
 */
export interface DirectControl {
  /**
   * Spring force acting opposite to wheel rotation.
   * - Range: -10000 to +10000
   * - Default: 0
   */
  springForce: number;

  /**
   * Constant force moving the wheel in a specific direction.
   * - Range: -10000 to +10000
   * - Default: 0
   */
  constantForce: number;

  /**
   * Periodic effect force (sine/triangle/etc). Not affected by dampening.
   * - Range: -10000 to +10000
   * - Default: 0
   */
  periodicForce: number;

  /**
   * Global force scaling factor (inverse).
   * - Formula: `TotalForce = InitialForce * (1 - ForceDrop / 100)`
   * - Range: 0 to 100
   * - Default: 0
   */
  forceDrop: number;
}

/**
 * Real-time device state received from the wheel controller.
 */
export interface DeviceState {
  firmwareVersion: FirmwareVersion;
  /** Registration status (0 = unregistered, 1 = registered). */
  isRegistered: number;

  /** Raw wheel position value.
   * - Range: -10000 to +10000 (roughly)
   */
  position: number;

  /** Raw torque value currently being output.
   * - Range: -10000 to +10000
   */
  torque: number;

  /**
   * Wheel position converted to degrees based on the active motion range.
   * @remarks Computed property. Null if motion range is not yet cached.
   */
  positionDegrees: number | null; // position in degrees

  /**
   * Current torque normalized to a percentage range (-100 to 100).
   * @remarks Computed property. Positive = Right (CW), Negative = Left (CCW).
   */
  torqueNormalized: number; // torque as -100 to 100
}

/**
 * Aggregated settings object containing all configuration groups.
 * @remarks This is a helper interface used by `readAllSettings()` and is not present in the original C++ API.
 */
export interface DeviceSettings {
  effects: EffectSettings;
  hardware: HardwareSettings;
  gpio: GpioSettings;
  adc: AdcSettings;
}

/** Event handler signatures for {@link WheelApi} events. */
export interface WheelEvents {
  /** Emitted when a device is successfully connected. */
  deviceConnected: (device: HIDDevice) => void;

  /** Emitted when the device is disconnected. */
  deviceDisconnected: (device: HIDDevice) => void;

  /** Emitted when new device state is received. */
  stateReceived: (state: DeviceState) => void;

  /** Emitted when an error occurs during background processing (e.g. parsing data).
   * @remarks Direct API calls (like sendSetting) reject their promise instead.
   */
  error: (error: Error) => void;
}
