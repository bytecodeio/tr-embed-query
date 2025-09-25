import React, { useEffect, useState } from "react";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, Checkbox, FormControlLabel } from "@mui/material";
import { Download, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { Embed } from "../EmbedQuery/Embed";

export const TrackingPoints = ({risk, updateCount, handleDownloadPDF, handleDownloadCSV, handleColumnUpdate, fieldsArr}) => {
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        const init = () => {
            setSelectedItems(risk.selectedColumns)
        }
        init();
    },[])

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleChange = (e) => {
        let items = [...selectedItems];
        if (e.target.checked) {
            setSelectedItems(prev => [...prev, e.target.value])
        } else {
            let index = items.indexOf(e.target.value);
            items.splice(index,1);
            setSelectedItems(items);
        }
    }

    const handleUpdateClick = () => {
        setOpen(false)
        handleColumnUpdate(risk, selectedItems);
    }


    return (
        <>
            <div style={{paddingBottom:'30px'}} className={`${risk.active? '':'hidden'}`}>
                <div style={{display:'flex'}}>
                    <h3>{risk.riskName}</h3>
                    <div style={{marginRight: '0', marginLeft: 'auto', paddingRight: '20px'}}>
                        <Button className="risk-button" onClick={handleOpen}><VisibilityOutlined /> Columns</Button>
                        <Button className="risk-button download" onClick={() => handleDownloadPDF(risk.query, risk)} style={{marginRight: '0', marginLeft: 'auto', paddingRight: '20px'}}>PDF <Download /></Button>
                        <Button className="risk-button download" onClick={() => handleDownloadCSV(risk.query, risk)} style={{marginRight: '0', marginLeft: 'auto', paddingRight: '20px'}}>CSV <Download /></Button>
                    </div>
                    
                </div>
                <div className="hide-menu"></div>
                <Embed queryId={risk.query} {...{risk}} {...{updateCount}} />
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Select Columns</DialogTitle>
                <DialogContent>
                    <FormGroup onChange={handleChange}>
                        {fieldsArr?.fields?.dimensions.map((dim) => (
                            <FormControlLabel control={<Checkbox />} label={dim.label_short} value={dim.name} checked={selectedItems.includes(dim.name)} />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions><Button onClick={handleUpdateClick}>Update</Button></DialogActions>
            </Dialog>
        </>
    )
}