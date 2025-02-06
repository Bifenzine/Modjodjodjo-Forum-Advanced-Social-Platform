import React from 'react';

const CheckBoxGender = ({ onCheckBoxChange, selectedGender }) => {
    const renderCheckbox = (gender) => (
        <>
            <input
                type="checkbox"
                id={gender}
                name="gender"
                value={gender}
                className="appearance-none h-4 w-4 border border-gray-300 rounded-3xl checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                checked={selectedGender === gender}
                onChange={() => onCheckBoxChange(gender)}
            />
            <label htmlFor={gender} className="text-slate-300">{gender.charAt(0).toUpperCase() + gender.slice(1)}</label>
        </>
    );

    return (
        <div className="flex items-center space-x-2 px-2 py-2">
            <label>Gender :</label>
            {renderCheckbox("male")}
            {renderCheckbox("female")}
        </div>
    );
};

export default CheckBoxGender;

















// import React from 'react'

// const CheckBoxGender = ({ onCheckBoxChange, selectedGender }) => {
//     return (
//         <>
//             <div className="flex items-center space-x-2 px-2 py-2">
//                 <label>Gender :</label>
//                 <input type="checkbox" id="male" name="gender" value="male" className="appearance-none h-4 w-4 border border-gray-300 rounded-3xl checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     checked={selectedGender === "male"}
//                     onChange={() => onCheckBoxChange("male")}
//                 />
//                 <label className="text-slate-300">Male</label>
//                 <input type="checkbox" id="female" name="gender" value="female" className="appearance-none h-4 w-4 border border-gray-300 rounded-3xl checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     checked={selectedGender === "female"}
//                     onChange={() => onCheckBoxChange("female")}
//                 />
//                 <label className="text-slate-300">Female</label>
//             </div>
//         </>
//     )
// }

// export default CheckBoxGender