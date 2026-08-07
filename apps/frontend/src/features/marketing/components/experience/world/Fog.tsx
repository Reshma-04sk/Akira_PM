import React from "react";

export const Fog: React.FC = () => {
  return (
    <fog
      attach="fog"
      args={["#07060a", 4.5, 17.5]}
    />
  );
};

export default Fog;
