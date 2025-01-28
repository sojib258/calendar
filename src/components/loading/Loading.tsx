"use client";
import { Box } from "@mui/material";
import Lottie from "react-lottie";

import animation from "@/../public/loading.json";

const Loading = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
  };

  return (
    <Box width="100%" height="100vh">
      <Lottie
        style={{ width: "300px", height: "100vh" }}
        options={defaultOptions}
        isClickToPauseDisabled={true}
      />
    </Box>
  );
};

export default Loading;
