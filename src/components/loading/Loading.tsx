import { Box } from "@mui/material";
import Lottie from "react-lottie";

import * as animationData from "@/../public/loading.json";

const Loading = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Box>
      <Lottie options={defaultOptions} />
    </Box>
  );
};

export default Loading;
