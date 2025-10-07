import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Switch, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { downloadQuery, downloadQueryCSV, downloadQueryPDF, getQueryForSlug, runQuery } from "../services/QueryService";
import { useModelExplore } from "../hooks/useModelExplore";
import { TrackingPoints } from "../components/TrackingPoints/TrackingPoints";

const riskTypes = [
    {
        riskName:'Account Mismatch',
        expression:'matches_filter(${recon_v6.tax_classification_code}, `DOM0`) AND matches_filter(${recon_v6.transaction_type}, `AR`)',
        active:true,
        query:'TvzBMtsar14DWPjzY2iSmQ',
        selectedColumns:[],
        count:0
    },
    {
        riskName:'Not in e-Invoicing',
        expression:'matches_filter(${recon_v6.a_reporting_line_tax_amount}, `0`)',
        active:false,
        query:'mCNqgykKpEV6tCJker6ksK',
        selectedColumns:[],
        count:0
    }
]


export const DynamicExplore = () => {
    const [queryId, setQueryId] = useState("TvzBMtsar14DWPjzY2iSmQ")
    const [toggleDialog, setToggleDialog] = useState(false);
    const [risks, setRisks] = useState([]);
    const [initialQuery, setInitialQuery] = useState({})
    const [showFields, setShowFields] = useState(false);

    const {fieldsArr} = useModelExplore()

    useEffect(() => {
        const init = async () => {
            let query = await getQueryForSlug(queryId)
            delete query.client_id;
            console.log("initial query", query)
            setInitialQuery(query);
            for await (let risk of riskTypes) {
                let res = await handleRunQuery(query, risk);
                console.log(risk)
                risk.query = res;
                setRisks(prev => [...prev, risk]);
            }
        }
        init()
    },[])

    const handleRunQuery = async (query, risk, selectedColumns = []) => {
        let payload = {...query};
        payload.filter_expression = risk.expression;
        //payload.fields = [...payload.fields, ...selectedColumns]
        let res = await runQuery(payload)
        if (!res) {
            return;
        }
        return res.client_id;
    }

    const handleDialogOpen = () => {
        setToggleDialog(true);
    }

    const handleDialogClose = () => {
        setToggleDialog(false);
    }

    const handleSwitchClick = (risk) => {
        let _risks = [...risks];
        let index = _risks.indexOf(risk);
        _risks[index].active = !_risks[index].active
        setRisks(_risks)
    }

    const handleColumnUpdate = async (risk, selectedColumns) => {
        let query = {...initialQuery};
        let _risks = [...risks]
        let index = _risks.indexOf(risk);
        _risks[index].selectedColumns = selectedColumns;
        let res = await handleRunQuery(query, risk, selectedColumns);
        risk.query = res;
        setRisks(_risks);
    }

    const handleDownloadPDF = async (slug, risk) => {
        let fileName = risk.riskName.replace(/[^a-zA-Z0-9]/g, '');
        let results = await downloadQueryPDF(slug);
        var link = document.createElement("a");
        link.href = URL.createObjectURL(results);
        link.download = `${fileName}.pdf`
        link.target = "_blank"
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const handleDownloadCSV = async (slug, risk) => {
        let fileName = risk.riskName.replace(/[^a-zA-Z0-9]/g, '');
        let results = await downloadQueryCSV(slug);
        var link = document.createElement("a");
        link.href = URL.createObjectURL(results);
        link.download = `${fileName}.csv`
        link.target = "_blank"
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const updateCount = (risk, obj) => {
        let _risks = [...risks]
        let index = _risks.indexOf(risk);
        setRisks(prevArr => 
            prevArr.map(item => 
                _risks.indexOf(item) == index? {...item, count:obj['count']}: item
            )
        )
    }

    const handleCloseFields = () => {
        setShowFields(false)
    }

    const handleOpenFields = () => {
        setShowFields(true)
    }

    return (
        <div>
            <div className="looker-content">
                <div style={{marginTop:'20px'}}>

                </div>
                <div className="looker-info">
                    <TextField className="looker-text" value={process.env.REACT_APP_LOOKER_MODEL} label="Looker Model"/> 
                    <TextField className="looker-text" value={process.env.REACT_APP_LOOKER_EXPLORE} label="Looker Explore"/> 
                    <Button onClick={handleOpenFields}>Show Fields</Button>
                </div>
                <div className="overview-section">
                    <h2>Overview</h2>
                </div>
            </div>
            <div style={{display:'flex'}}>   
                <div className="risk-sidebar">
                    <h3>Tracking points</h3>
                    {risks?.map(type => (
                        <div style={{display:'flex', alignItems:'center', borderBottom:'1px solid lightgrey', padding:'5px'}}>
                            <div className="risk-info">
                                <p>{type.riskName}</p>
                                <h3>{type.count == 0? <br /> : type.count}</h3>
                            </div>
                            <div style={{marginLeft:'auto',marginRight:'0'}}>
                                <Switch  checked={type.active} onClick={() => handleSwitchClick(type)}/>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                    {risks?.length > 0 &&
                        risks?.map((risk) => (
                             <TrackingPoints {...{risk}} {...{handleDownloadPDF}} {...{handleDownloadCSV}}  {...{handleColumnUpdate}} {...{updateCount}} {...{fieldsArr}} />                            
                        ))
                    }                    
                </div>
            </div>
            <Dialog open={showFields} onClose={handleCloseFields} maxWidth="lg">
                <DialogTitle>Model Explore Fields</DialogTitle>
                <DialogContent>
                    <div className="vertical-list">
                        <div>
                            <h3>Dimensions</h3>
                            {fieldsArr?.fields?.dimensions.map(({label_short}) => (
                                <p>{label_short}</p>
                            ))}
                        </div>
                        <div>
                            <h3>Measures</h3>
                            {fieldsArr?.fields?.measures.map(({label_short}) => (
                                <p>{label_short}</p>
                            ))}
                        </div>
                        <div>
                            <h3>Filters</h3>
                            {fieldsArr?.fields?.filters.map(({label_short}) => (
                                <p>{label_short}</p>
                            ))}
                        </div>
                        <div>
                            <h3>Parameters</h3>
                            {fieldsArr?.fields?.parameters.map(({label_short}) => (
                                <p>{label_short}</p>
                            ))}
                        </div>

                    </div>

                </DialogContent>
                <DialogActions></DialogActions>
            </Dialog>
        </div>
    )
}