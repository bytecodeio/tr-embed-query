import React from "react";
import { Box } from "@mui/material";

export const EmbedContainer = React.forwardRef((props, ref) => (
  <>
    <Box
      sx={{
        height: "650px",
        width: "80vw",
        marginTop:"-30px",
        zIndex:"99",
        position:"relative",
        "> iframe": {
          height: "100%",
          width: "100%",
          border:"0"
        },
      }}
      ref={ref}
    />
  </>
  
));
