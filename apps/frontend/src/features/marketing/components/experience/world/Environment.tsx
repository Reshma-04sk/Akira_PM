import React from "react";
import { Environment as DreiEnvironment } from "@react-three/drei";

export const Environment: React.FC = () => {
  return (
    <DreiEnvironment
      preset="sunset"
      // Cache files immediately or use high-performance mode
    />
  );
};

export default Environment;
