//controller for invalid request paths
export function invalidRequest(req,res){
    try{
        return res.status(404).json({message:"Invalid request path!"});

    }catch(e){
                // to log the error in the error file
                log(`URL: ${req.url} ${error}`, "error.txt");
                return res.status(500).json({ message: "Internal server error!" });
    }


}
