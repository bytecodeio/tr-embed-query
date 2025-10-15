const bodyParser = require('body-parser');
const express = require('express');
const { readFile, readFileSync } = require('fs');
const path = require('path')


const puppeteer = require('puppeteer')

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const port = 8080;

const embed_user = {
    "target_url": '',
    "external_user_id": "recon_sso_user",
    "first_name": "Recon",
    "last_name": "SSO",
    "session_length": 36000,
    "force_logout_login": true,
    "group_ids": [10],
    "embed_domain":"http://localhost:3000"
}


const getAdminUserToken = () => {
    return fetch('https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/login?client_id=Nm8Qt36YTG8X6csqBwkn&client_secret=G5w4KyzgmKnwcGjVqq4p4Vt4',
        {
            method:'POST'
        }
    ).then(res => res.json())
}

const getEmbedUserToken = (token, user_id) => {
    return fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/login/${user_id}`,
        {
            method:'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).then(res => res.json())
}

const getMe = (token) => {
        return fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/user`,
        {
            method:'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).then(res => res.json())
}

const getEmbedUser = (token) => {
    let payload = new URLSearchParams();
    payload.set("first_name", embed_user.first_name);
    payload.set("last_name", embed_user.last_name);
    payload.set("embed_user", true)

    return fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/users/search?${payload.toString()}`,
        {
            method:'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).then(res => res.json())
}

app.get('/api/customers', async (req,res) => {
    let response = {};
    const customers = [
        {id:1, firstName:"Aaron", lastName:"Modic"}
    ]

    let {access_token} = await getAdminUserToken();

    if (access_token) {
        let userToken = await getEmbedUserToken(access_token, '123');
        if (userToken) {
            let me = await getMe(userToken.access_token);
            response = me;
        }
    }

    res.json(response);
})

app.post('/api/query/slug', bodyParser.json(), async (req, res) => {
    let {slug} = req.body;
    let query = {};
    try {
        let token = await getAdminUserToken();


        query = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/slug/${slug}`, {
            method:'GET',
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json())
        console.log("query", query)
    } catch (ex) {
        console.error(`Error getting slug: ${ex}`);
    }
    console.log(query)
    return res.json(query);
})

app.post('/api/query/run', bodyParser.json(), async (req, res) => {
    let {payload} = req.body;
    let query = {};
    try {
        let token = await getAdminUserToken();

        query = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries`, {
            method:'POST',
            body: JSON.stringify(payload),
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json())
    } catch (ex) {
        console.error(`Error running query: ${ex}`);
    }
    return res.json(query);
})


app.post('/api/model/explore', bodyParser.json(), async (req, res) => {
    let {model,explore} = req.body;
    let fields = [];
    try {
        let token = await getAdminUserToken();
        fields = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/lookml_models/${model}/explores/${explore}`, {
            method:'GET',
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json())
    } catch (ex) {
        console.error(ex);
    }
    return res.json(fields);
})

app.post('/api/query/count', bodyParser.json(), async (req, res) => {
    let {id} = req.body;
    let results = [];
    try {
        let token = await getAdminUserToken();

        let embedUserRes = await getEmbedUser(token.access_token);

        let {id:embedId} = embedUserRes[0];

        let embedToken = await getEmbedUserToken(token.access_token, embedId);

        results = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/${id}/run/json`, {
            method:'GET',
            headers:{
                Authorization: `Bearer ${embedToken.access_token}`
            }
        }).then(res => res.json())

    } catch (ex) {
        console.error(ex);
    }
    return res.json({count:results.length});
})

app.post('/api/query/download/pdf', bodyParser.json(), async (req, res) => {
    let {slug} = req.body;
    let query = {};
    let file = {};
    let pdfBuffer;
    try {
        let token = await getAdminUserToken();
        query = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/slug/${slug}`, {
            method:'GET',
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json())
    } catch (ex) {
        console.error(ex);
    }

    if (query) {
        try {
            let token = await getAdminUserToken();
            let embedUserRes = await getEmbedUser(token.access_token);

            let {id:embedId} = embedUserRes[0];

            let embedToken = await getEmbedUserToken(token.access_token, embedId);
            file = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/${query.slug}/run/html`, {
                method:'GET',
                headers:{
                    Authorization: `Bearer ${embedToken.access_token}`
                }
            }).then(res => res.text())

            const cssPath = path.join(__dirname, 'public', 'style.css');
            const css = await readFileSync(cssPath, 'utf8');
            //let html = readFileSync(file, 'utf8');
            let modifiedHtml = file.replace(
                '</head>',
                `<style>\n ${css} </style></head>`
            );

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setContent(modifiedHtml, {waitUntil: 'networkidle0'});

            pdfBuffer = await page.pdf({format:'A4', printBackground:true});

            await browser.close();

        } catch (ex) {
            console.error(ex);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="page.pdf"');
        res.end(pdfBuffer)
    }
})

app.post('/api/query/download/csv', bodyParser.json(), async (req, res) => {
    let {slug} = req.body;
    let query = {};
    let file = {};
    try {
        let token = await getAdminUserToken();
        query = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/slug/${slug}`, {
            method:'GET',
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json())
    } catch (ex) {
        console.error(ex);
    }

    if (query) {
        try {
            let token = await getAdminUserToken();
            let embedUserRes = await getEmbedUser(token.access_token);

            let {id:embedId} = embedUserRes[0];

            let embedToken = await getEmbedUserToken(token.access_token, embedId);
            file = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/queries/${query.slug}/run/csv`, {
                method:'GET',
                headers:{
                    Authorization: `Bearer ${embedToken.access_token}`
                }
            }).then(res => res.text())

        } catch (ex) {
            console.error(ex);
        }
        res.setHeader('Content-Type', 'text/csv');
        res.send(file)
    }
})

app.post('/api/auth/sso', bodyParser.json(), async (req, res) => {
    let {targetURL} = req.body;
    let payload = embed_user;
    payload.target_url = targetURL;
    let results = '';
    try {
        //results = await sdk.ok(sdk.create_sso_embed_url(payload))
        let token = await getAdminUserToken();
        results = await fetch(`https://c3bac00e-a0f2-48a5-8f1e-4ae3576a2a12.looker.app/api/4.0/embed/sso_url`, {
            method:'POST',
            headers:{
                Authorization: `Bearer ${token.access_token}`
            },
            body:JSON.stringify(payload)
        }).then(res => res.json())
        console.log(results)
    } catch (ex) {
        console.error(ex);
    }
    return res.json(results);
})


app.listen(port, () => console.log(`Server started on ${port}`));
