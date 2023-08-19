const resourceNotFound=async(req,res)=>{
    return res.status(404).send("<h1>Invalid path, Api not found</h1>");
}

export {resourceNotFound};