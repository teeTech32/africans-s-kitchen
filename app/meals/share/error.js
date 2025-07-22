"use client"

export default function errorHandling({error}){
  console.log(error)
  return<main className="flex flex-col">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-600 to-orange-600 font-extrabold  text-xl md:text-2xl xl:text-3xl text-center mt-20">Error!!!</p>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-600 to-orange-600 font-extrabold  text-xl md:text-2xl xl:text-3xl text-center mt-15 mx-20">Check your inputs, a more than 3mb image is not allowed !...</h1>
        </main>
}