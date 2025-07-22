"use client"

import { useRef, useState } from "react"
import Image from "next/image"

export default function ImagePicker({label, name}){
  const [pickedImage, setPickedImage] = useState(null)
  const PickImage = useRef()

  function handleImagePicker(){
    PickImage.current.click();
  }

  function handlePickedImage(event){
    const file = event.target.files[0];
    //I checked if a file was actually picked when the function trigger
    if(!file){
      setPickedImage(null)
      return;
    }
    //if file picked, then let generate a method called readAsDataURL() through a class function called FileReader(), so that I could make the picked image visible on the client-side as url source element.
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file)
    fileReader.onload = ()=>{
      setPickedImage(fileReader.result)
    }
  }

  return<div>
          <label htmlFor={name} className="mx-5 text-gray-400 text-xs md:text-sm xl:text-lg font-semibold">{label}</label>
          <div className="flex flex-row">
            <div className="container w-40 md:w-50 xl:w-60 h-40 md:h-50 xl:h-60 border-2 border-white mx-5">
              {!pickedImage && <p className="text-center text-white text-xs font-semibold md:text-sm p-5">No Image picked yet</p> }
              {pickedImage && <Image src={pickedImage}  alt="Preveiwed image" width={150} height={150} className="w-40 h-39 md:w-50 xl:w-60 md:h-49 xl:h-59 object-cover"/>}
            </div>
            <button type="button" className="w-30 h-10 md:w-40 p-2 bg-gray-300 text-xs font-semibold md:text-sm  mx-5 rounded-sm cursor-pointer absolute right-0 z-10" onClick={handleImagePicker}>Pick an image</button>
          </div>
          <div className="hidden">
            <input type="file" 
                    id={name} 
                    name={name}
                    accept="image/png, image/jpeg, image/jpg" 
                    required
                    ref={PickImage}
                    className="mx-5 "
                    onChange={handlePickedImage}/>
          </div>
        </div>
}