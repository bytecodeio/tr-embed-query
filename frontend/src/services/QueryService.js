export const getQueryForSlug = async (slug) => {
    let query = {};
    try {
        await fetch('/api/query/slug', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    slug:slug
            })
         }).then(res => res.json()).then(q => query = q);
    } catch(ex) {
        console.error(`Failed to get query: ${ex}`);
    }
    return query
}

export const runQuery = async (payload) => {
    let res = {};
    try {
        await fetch('/api/query/run', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    payload:payload
            })
         }).then(res => res.json()).then(q => res = q);
    } catch(ex) {
        console.error(`Failed to create query: ${ex}`);
    }
    return res
}

export const downloadQueryPDF = async (slug) => {
    let file = {};
    try {
        await fetch('/api/query/download/pdf', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    slug:slug
            })
         }).then(res => res.blob()).then(q => file = q);
    } catch(ex) {
        console.error(`Failed to get query: ${ex}`);
    }
    return file
}


export const downloadQueryCSV = async (slug) => {
    let file = {};
    try {
        await fetch('/api/query/download/csv', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    slug:slug
            })
         }).then(res => res.blob()).then(q => file = q);
    } catch(ex) {
        console.error(`Failed to get query: ${ex}`);
    }
    return file
}

export const getQueryCount = async (id) => {
    let count = {};
    try {
        await fetch('/api/query/count', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    id:id
            })
         }).then(res => res.json()).then(q => count = q);
    } catch(ex) {
        console.error(`Failed to get query: ${ex}`);
    }
    return count
}