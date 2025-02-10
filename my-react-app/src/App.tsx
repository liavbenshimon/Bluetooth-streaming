import { useState } from "react";

function App() {
  const [deviceName, setDeviceName] = useState(null);
  const [error, setError] = useState(null);

  const connectToBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // אפשר גם לסנן לפי שירותים מסוימים
      });

      setDeviceName(device.name || "Unknown Device");
    } catch (err) {
      setError("Failed to connect: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-4 border rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2">Bluetooth Connector</h2>
        <button
          onClick={connectToBluetooth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect to Bluetooth
        </button>
        {deviceName && <p className="mt-4">Connected to: {deviceName}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default App;
