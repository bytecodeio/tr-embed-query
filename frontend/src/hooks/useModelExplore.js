import { useEffect, useState, useContext } from "react"
import { getModelExploreFields } from "../services/ModelExploreService";

export const useModelExplore = () => {
    const [fieldsArr, setFieldsArr] = useState([])
    let model = process.env.REACT_APP_LOOKER_MODEL;
    let explore = process.env.REACT_APP_LOOKER_EXPLORE;

    useEffect(() => {        
        const getFields = async () => {
            let fieldList = await getModelExploreFields(model,explore);
            setFieldsArr(fieldList)
            console.log(fieldList)
        }        
        getFields();
    },[])

    return {fieldsArr};
}