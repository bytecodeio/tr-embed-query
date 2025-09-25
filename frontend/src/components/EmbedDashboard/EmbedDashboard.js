import React, { useCallback, useContext, useState, useEffect, useRef } from "react";
import { EmbedContainer } from "./EmbedContainer/EmbedContainer";
import { LookerEmbedSDK } from "@looker/embed-sdk";

export const EmbedDashboard = ({ dashboardId, setDashboard, handleDashboardOptions}) => {
  //const extensionSDK = useContext(ExtensionContext)
  //const [dashboard, setDashboard] = useState({})


  const setupDashboard = (dash) => {
    setDashboard(dash)
  }

  const embedDashboard = useCallback(
    (embedContainer) => {
      const hostUrl = process.env.REACT_APP_LOOKER_HOST_URL;
      console.log(hostUrl)
      if (embedContainer && dashboardId && hostUrl) {
        embedContainer.innerHTML = "";
        //const embedUrl = `${hostUrl}/embed/dashboards/${dashboardId}?embed_domain=${'http://localhost:3000'}&theme=Looker`;
        LookerEmbedSDK.init(hostUrl);

        //Use below if using embed user
        //LookerEmbedSDK.init(hostUrl, {url:'/api/auth'});
        LookerEmbedSDK.createDashboardWithId(dashboardId)
          .appendTo(embedContainer)
          .on('dashboard:run:complete', handleDashboardOptions)
          .build()
          .connect()        
          .then(setupDashboard)
          .catch((e) => console.error(e));
      }
    },
    [dashboardId]
  );

  return <EmbedContainer ref={embedDashboard} />;
};
