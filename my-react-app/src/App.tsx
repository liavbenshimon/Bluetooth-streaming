// --- React Web App (using WebSockets) ---

import React, { useState, useEffect } from "react";

function BluetoothApp() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Add a loading state

  useEffect(() => {
    // Connect to the native app's WebSocket server
    const ws = new WebSocket("ws://localhost:8765"); // Replace with your native app's address

    ws.onopen = () => {
      console.log("Connected to native app");
      setSocket(ws); // Store the socket in state
      // Request the list of connected devices
      ws.send(JSON.stringify({ type: "getDevices" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received from native app:", data);

        if (data.type === "devicesList") {
          setDevices(data.devices);
          setLoading(false); // Turn off loading state when devices are received
        } else if (data.type === "batteryLevel") {
          setBatteryLevel(data.level);
          setLoading(false); // Turn off loading state
        } else if (data.type === "error") {
          setError(data.message);
          setLoading(false); // Turn off loading
        }
      } catch (e) {
        console.error("Error parsing message from native app:", e);
        setError("Error communicating with native app.");
        setLoading(false);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from native app");
      setSocket(null);
      setError("Disconnected from native app.  Ensure it's running.");
      setLoading(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket error. Check console for details.");
      setLoading(false);
    };

    // Cleanup function: close the WebSocket when the component unmounts
    return () => {
      if (ws) {
        // Check if ws is defined (it might not be if the connection failed)
        ws.close();
      }
    };
  }, []); // Empty dependency array:  run this effect only once on mount

  const getBattery = (device) => {
    setSelectedDevice(device);
    setBatteryLevel(null); // Clear previous battery level
    setLoading(true); // Set loading to true when requesting battery
    if (socket) {
      socket.send(
        JSON.stringify({ type: "getBattery", deviceAddress: device.address })
      );
    } else {
      setError("Not connected to the native app."); // Handle case where socket isn't ready
    }
  };

  return (
    <div>
      <h1>Bluetooth Devices</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <p>Loading...</p>} {/* Show loading indicator */}
      {!loading && devices.length === 0 && (
        <p>
          No devices found. Make sure the native app is running and Bluetooth is
          enabled.
        </p>
      )}
      {!loading && devices.length > 0 && (
        <ul>
          {devices.map((device) => (
            <li key={device.address}>
              {device.name} ({device.address}){" "}
              <button onClick={() => getBattery(device)} disabled={loading}>
                Get Battery
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedDevice && batteryLevel !== null && (
        <div>
          <h2>Battery Level for {selectedDevice.name}</h2>
          <p>{batteryLevel}%</p>
        </div>
      )}
      {selectedDevice && batteryLevel === null && !loading && (
        <div>
          <h2>Battery Level for {selectedDevice.name}</h2>
          <p>Battery information not available.</p>
        </div>
      )}
    </div>
  );
}

export default BluetoothApp;
