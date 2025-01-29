import { Box } from "@mui/material";

import spinner from "@/../public/spinner.json";
import Lottie from "react-lottie";
const LoadingSpinner = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: spinner,
  };

  return (
    <Box width="100%" height="10vh">
      <Lottie
        style={{
          width: "100px",
          height: "12vh",
        }}
        options={defaultOptions}
        isClickToPauseDisabled={true}
      />
    </Box>
  );
};

export default LoadingSpinner;
