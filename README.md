# FFBeast Wheel WebHID API

[![Build Status](https://github.com/shubham0x13/ffbeast-wheel-webhid-api/actions/workflows/ci.yml/badge.svg)](https://github.com/shubham0x13/ffbeast-wheel-webhid-api/actions)
[![Documentation](https://img.shields.io/badge/docs-online-blue)](https://shubham0x13.github.io/ffbeast-wheel-webhid-api/)
[![NPM Version](https://img.shields.io/npm/v/@shubham0x13/ffbeast-wheel-webhid-api)](https://www.npmjs.com/package/@shubham0x13/ffbeast-wheel-webhid-api)
[![License](https://img.shields.io/npm/l/@shubham0x13/ffbeast-wheel-webhid-api)](./LICENSE)

A TypeScript WebHID-based API for communicating with [FFBeast](https://ffbeast.github.io/) force feedback wheel controllers directly from the browser.

This library is a TypeScript rewrite of the original C/C++ API, adapted to use the [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) for browser-based applications. The original C/C++ source code is available in the [`reference_cpp`](https://github.com/shubham0x13/ffbeast-wheel-webhid-api/tree/main/reference_cpp) directory for reference.

> **Note:** This API includes additional helper methods and properties not present in the original C/C++ implementation, such as `readAllSettings()`, `positionDegrees`, `torqueNormalized`, and more for convenience.

## Features

- 🎮 **Direct wheel communication** via WebHID (no drivers or native apps required)
- 📊 **Real-time device state** - position, torque, firmware version
- ⚙️ **Full settings control** - effect settings, hardware settings, GPIO, ADC configurations
- 🔧 **Direct force feedback control** - spring, constant, and periodic forces
- 📡 **Event-driven architecture** - subscribe to device state changes
- 🔒 **Type-safe** - full TypeScript support with comprehensive types

## Documentation

📚 **[Full API Documentation](https://shubham0x13.github.io/ffbeast-wheel-webhid-api/)**

## Browser Support

> **Note:** Supported in all modern Chromium-based browsers (e.g., Chrome, Edge, Opera, Brave, etc).

| Browser        | Supported |
| -------------- | --------- |
| Chromium-based | ✅        |
| Firefox        | ❌        |
| Safari         | ❌        |

## Installation

```bash
npm i @shubham0x13/ffbeast-wheel-webhid-api
```

## Quick Start

```typescript
import { WheelApi } from "@shubham0x13/ffbeast-wheel-webhid-api";

const wheel = new WheelApi();

wheel.on("stateReceived", (state) => {
  console.log("Position:", state.positionDegrees);
  console.log("Torque:", state.torqueNormalized);
});

wheel.on("deviceConnected", (device) => {
  console.log("Connected to:", device.productName);
});

// Connect to the wheel (opens browser device picker)
await wheel.connect();

// Cleanup when done
await wheel.disconnect();
wheel.destroy();
```

## Requirements

- Node.js >= 20.19.0
- A Chromium-based browser with WebHID support
- An FFBeast wheel controller

## License

This project is licensed under the [MIT License](./LICENSE)
