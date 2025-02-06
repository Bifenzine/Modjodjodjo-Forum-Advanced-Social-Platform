import React from 'react'

const PopularLatestSelect = () => {
    return (
        <>
            <div className="bg-slate-900  rounded-lg w-[5rem] ">
                {/* <label className="text-slate-400 text-sm px-1 mb-2">Sorted by :</label> */}
                <div className=" w-[7rem] appearance-none bg-transparent outline-none border rounded-lg border-blue-900">
                    <div className="  w-full flex items-center ">
                        <select className="text-sm w-full text-white   bg-slate-800 outline-none rounded-lg py-[0.20rem] ">
                            <option>Popular</option>
                            <option>Latest</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PopularLatestSelect