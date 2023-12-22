import { Storage } from "@google-cloud/storage";
  
  
const projectId=process.env.GCS_PROJECT_ID.toString().replace(/\\n/g, '\n');
const bucketName=process.env.GCS_BUCKET_NAME.toString().replace(/\\n/g, '\n')
const storage=new Storage({projectId,credentials:{
    client_email: process.env.GCS_CLIENT_EMAIL.toString().replace(/\\n/g, '\n'),
    private_key: process.env.GCS_PRIVATE_KEY.toString().replace(/\\n/g, '\n')
}});

//to upload the file on cloud
async function uploadFileCloud(file,fileOutputName){

    try {
        const bucket=storage.bucket(bucketName);
        const obj=await bucket.upload(file,{destination:fileOutputName});
        return {obj};
        
    } catch (error) {
        return {error};
        
    }
}

//to delete the file from cloud
async function deleteFileCloud(songPath,coverPath){
    try {
        const bucket=storage.bucket(bucketName);
        await bucket.file(songPath).delete();
        await bucket.file(coverPath).delete();
        return true;
        
    } catch (error) {
        console.log(error);
        return false;
        
    }
}

//to generate presigned email
async function generatePresignedUrl(songPath){
    const bucket = storage.bucket(bucketName);
  
    return await bucket.file(songPath).getSignedUrl({
      action: 'read',
      // Expires in 1 hour
      expires: Date.now() + 60 * 60 * 1000 
    });
  };
  
//exporting methods
export {uploadFileCloud,deleteFileCloud,generatePresignedUrl};
