// RegistrationForm.js
import React, { useState } from 'react';
import '../../Pages/AuthRegis/authRegis.css'

import CheckBoxGender from '../AuthComponents/CheckBoxGender/CheckBoxGender

const RegistrationForm = ({ onSubmit, changeLogStat }) => {
    const [inputs, setInputs] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
    });

    const handleCheckBoxGender = (gender) => {
        setInputs({ ...inputs, gender });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputs);
    };

    return (
        <form className="form border-2 mt-4 mb-8 bg-slate-900 border-slate-600" onSubmit={handleSubmit}>
            <p className="title">Register</p>
            <p className="message">Sign up now and get full access to our app.</p>
            <div className="flexo">
                <label>
                    <input required="" placeholder="" type="text" className="input bg-slate-900"
                        value={inputs.fullName}
                        onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
                    />
                    <span>Full name</span>
                </label>
                <label>
                    <input required="" placeholder="" type="text" className="input bg-slate-900"
                        value={inputs.username}
                        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                    />
                    <span>Username</span>
                </label>
            </div>
            <label>
                <input required="" placeholder="" type="email" className="input bg-slate-900"
                    value={inputs.email}
                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                />
                <span>Email</span>
            </label>
            <label>
                <input required="" placeholder="" type="password" className="input bg-slate-900"
                    value={inputs.password}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                />
                <span>Password</span>
            </label>
            <label>
                <input required="" placeholder="" type="password" className="input bg-slate-900"
                    value={inputs.confirmPassword}
                    onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                />
                <span>Confirm password</span>
            </label>
            <CheckBoxGender onCheckBoxChange={handleCheckBoxGender} selectedGender={inputs.gender} />
            <button className="submit" type='submit'>Submit</button>
            <p className="signin cursor-pointer">Already have an account? <span className='text-blue-500' onClick={changeLogStat}>Log in</span> </p>
        </form>
    );
};

export default RegistrationForm;