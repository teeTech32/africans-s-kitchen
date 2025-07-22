"use client"

import { useState } from "react";
import MealItem from "./MealItem";
import { GrFormSearch } from "react-icons/gr";

export default function MealGrid({meals}){
  const [filterName, setFilterName] = useState('');

  function handleOnchange(e){
    setFilterName(e.target.value)
  }

  const filterMeals = filterName ? meals.filter((meal) => meal.title.toLowerCase().includes  (filterName.toLowerCase())) : meals

  return<>
          <div className="lg:float-right lg:absolute lg:top-60 right-10 xl:right-6">
            <div className="mx-5 my-2 flex flex-col ml-10 ">
                <label htmlFor="jobTitle" className="text-gray-400 text-xs md:text-sm xl:text-lg font-semibold mb-1" data-aos='flip-right'
                                    data-aos-offset='200'
                                    data-aos-delay='100'
                                    data-aos-duration='1000'
                                    data-aos-easing='ease-in-out'>
                                      QUICK SEARCH
                  </label>
                <div className="relative z-10 text-xs"  data-aos='fade-left'
                                                        data-aos-offset='200'
                                                        data-aos-delay='400'
                                                        data-aos-duration='1000'
                                                        data-aos-easing='ease-in-out'>
                  <div className="relative">
                    <input type="text" value={filterName} placeholder="Use meal Title" onChange={handleOnchange} className=" w-70 py-2 pl-7 pr-2 bg-gray-900 rounded-sm text-white text-xs md:text-sm " />
                    <div className="absolute top-1 left-1 w-6 h-6">
                      <GrFormSearch className="text-white w-full h-full" />
                    </div>
                  </div>
                </div>
              </div>
          </div>
          <ul className="m-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filterMeals.map((meal)=>(
              <li key={meal.id}>
                <MealItem {...meal}/>
              </li>
            ))}
          </ul>
        </>
}