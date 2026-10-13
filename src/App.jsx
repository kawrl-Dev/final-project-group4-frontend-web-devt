import { usePWA } from './hooks/usePWA';

export default function App() {
  const { isInstallable, installApp, isOnline } = usePWA();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>.</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem" }}>
        Your PWA is ready. Start building amazing things!
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <div style={{ 
          padding: "0.5rem 1rem", 
          background: "#2563eb", 
          color: "white", 
          borderRadius: "0.5rem",
          fontSize: "0.9rem"
        }}>
          📱 PWA Enabled
        </div>
        
        <div style={{ 
          padding: "0.5rem 1rem", 
          background: isOnline ? "#10b981" : "#ef4444", 
          color: "white", 
          borderRadius: "0.5rem",
          fontSize: "0.9rem"
        }}>
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </div>
        
        {isInstallable && (
          <button
            onClick={installApp}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            📲 Install App
          </button>
        )}
      </div>
    </div>
  );
}