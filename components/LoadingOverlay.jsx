import React, { ReactElement } from "react";
import { DotLoader } from "react-spinners";

export default function LoadingOverlay({
  additionalText,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <DotLoader color={"#0045f4"} loading={true} size={120} />
    </div>
  );
}
