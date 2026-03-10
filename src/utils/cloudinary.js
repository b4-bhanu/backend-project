import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
// fs is file system

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            // ctrl + space for options
            public_id: "shoes",
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary", response.url);
        // console.log(response);
        fs.unlinkSync(localFilePath);
        //deletes the local file after it has been uploaded on cloudinary.
        return response;

    } catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed.
        return null;
    }
}


export {uploadOnCloudinary};


/*


file is uploaded on cloudinary http://res.cloudinary.com/dhjljgsz0/image/upload/v1772180814/shoes.jpg

output for console.log(response);
{
  asset_id: 'd20696e71ff2063fd77b31ef0cf47912',
  public_id: 'shoes',
  version: 1772180814,
  version_id: '09d8cd7e9a23746ca1944f4e87569e24',
  signature: '625091026b31d23c826c732aa40672fa7ca937c4',
  width: 1259,
  height: 1600,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2026-02-27T08:26:54Z',
  tags: [],
  bytes: 95582,
  type: 'upload',
  etag: '2a0f7059cbdc51e735238c274a29653b',
  placeholder: false,
  url: 'http://res.cloudinary.com/dhjljgsz0/image/upload/v1772180814/shoes.jpg',
  secure_url: 'https://res.cloudinary.com/dhjljgsz0/image/upload/v1772180814/shoes.jpg',
  asset_folder: '',
  display_name: 'shoes',
  overwritten: true,
  original_filename: 'sidPhoto',
  original_extension: 'jpeg',
  api_key: '899955345713845'
}
*/






       

