import React, { useCallback, useContext, useState, useEffect, useRef } from "react";
import { EmbedContainer } from "./EmbedContainer/EmbedContainer";
import { LookerEmbedSDK } from "@looker/embed-sdk";
import { getQueryCount } from "../../services/QueryService";
import { getEmbedURL } from "../../services/AuthService";

export const Embed = ({ queryId, risk, updateCount}) => {

  const handleRun = async () => {
    console.log("run start")
    let count = await getQueryCount(queryId);
    updateCount(risk, count)
  }

  const createTargetURL = (hostUrl) => {
    let model = process.env.REACT_APP_LOOKER_MODEL;
    let explore = process.env.REACT_APP_LOOKER_EXPLORE;
    return `${hostUrl}/embed/query/${model}/${explore}?qid=${queryId}&embed_domain=http://localhost:3000`
  }

  const eventHandler = async (message, el, hostUrl) => {
    if (message.source === el.contentWindow) {      
      if (message.origin === hostUrl && !message.data['__sjPulseBindFrames']) {
        try {
          let event = JSON.parse(message.data) 
          if (event.type == "explore:run:start") {
            handleRun();
          }
        } catch {}
    }
  }
}


  const embed = useCallback(
    async (embedContainer) => {
      const hostUrl = process.env.REACT_APP_LOOKER_HOST_URL;
      if (embedContainer && hostUrl) {
        embedContainer.innerHTML = '';        
        let el = document.createElement('iframe')
        el.className='embed-frame'
        el.id='embed-frame'
        window.addEventListener("message", (event) => eventHandler(event, el, hostUrl))
        let targetURL = await createTargetURL(hostUrl);
        let embedURL = await getEmbedURL(targetURL);
        el.src = embedURL;
        embedContainer.appendChild(el);
      }
    },
    [queryId]
  );

  return  <EmbedContainer className='main-content-container' ref={embed} />;
};
