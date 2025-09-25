export const getModelExploreFields =async (model, explore) => {
    let fields = [];
    try {
        await fetch('/api/model/explore', {
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify(
                {
                    model:model,
                    explore:explore
                }
            )
         }).then(res => res.json()).then(a => fields = a);
    } catch(ex) {
        console.error(`Failed to get artifact: ${ex}`);
    }
    return fields
}