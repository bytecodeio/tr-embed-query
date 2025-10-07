const { Looker40SDK, Looker31SDK } = require('@looker/sdk');
const { NodeSettingsIniFile, NodeSession } = require('@looker/sdk-node');
const bodyParser = require('body-parser');
const express = require('express');
const { readFile, readFileSync } = require('fs');
const path = require('path')

const puppeteer = require('puppeteer')



const localConfig = path.resolve(__dirname, './looker.ini')
const settings = new NodeSettingsIniFile(localConfig);
const session = new NodeSession(settings);
const sdk = new Looker40SDK(session);

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
    "group_ids": [2],
    "embed_domain":"http://localhost:3000"
  }


app.get('/api/customers', (req,res) => {
    const customers = [
        {id:1, firstName:"Aaron", lastName:"Modic"}
    ]

    res.json(customers);
})

app.post('/api/query/slug', bodyParser.json(), async (req, res) => {
    let {slug} = req.body;
    console.log(slug)
    let query = {};
    try {
        //query = await sdk.ok(sdk.me())
        query = await sdk.ok(sdk.query_for_slug(slug))
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
        query = await sdk.ok(sdk.create_query(payload))
    } catch (ex) {
        console.error(`Error running query: ${ex}`);
    }
    return res.json(query);
})


app.post('/api/model/explore', bodyParser.json(), async (req, res) => {
    let {model,explore} = req.body;
    let fields = [];
    try {
        fields = await sdk.ok(sdk.lookml_model_explore({lookml_model_name:model, explore_name:explore, fields:'fields'}))
    } catch (ex) {
        console.error(ex);
    }
    return res.json(fields);
})

app.post('/api/query/count', bodyParser.json(), async (req, res) => {
    let {id} = req.body;
    let results = [];
    try {
        results = await sdk.ok(sdk.run_query({query_id:id, result_format:'json', cache:true}))
        console.log(results)
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
        query = await sdk.ok(sdk.query_for_slug(slug))
    } catch (ex) {
        console.error(ex);
    }
    console.log("query ",query)

    if (query) {
        try {
            file = await sdk.ok(sdk.run_query({result_format:'html', 'query_id':query.slug}));

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
        query = await sdk.ok(sdk.query_for_slug(slug))
    } catch (ex) {
        console.error(ex);
    }
    console.log("query ",query)

    if (query) {
        try {
            file = await sdk.ok(sdk.run_query({result_format:'csv', 'query_id':query.slug}));

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
        results = await sdk.ok(sdk.create_sso_embed_url(payload))
        console.log(results)
    } catch (ex) {
        console.error(ex);
    }
    return res.json(results);
})


app.listen(port, () => console.log(`Server started on ${port}`));
