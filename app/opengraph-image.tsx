import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)",
          fontSize: 64,
          color: "#124c22"
        }}
      >
        <div style={{ fontWeight: 800 }}>Green Silicon Valley</div>
        <div style={{ fontSize: 26, marginTop: 10, color: "#2c7a3f" }}>
          Environmental STEM by Students, for Students
        </div>
      </div>
    ),
    size
  );
}


