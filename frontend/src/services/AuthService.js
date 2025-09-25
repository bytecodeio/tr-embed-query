import React from "react";

export const getEmbedURL = async (targetURL) => {
    let embedUrl="";
    try {
        await fetch('/api/auth/sso', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    targetURL:targetURL
                }
            )
         }).then(res => res.json()).then(a => embedUrl = a?.url);
    } catch(ex) {
        console.error(`Failed to get artifact: ${ex}`);
    }
    return embedUrl
}