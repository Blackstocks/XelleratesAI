import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import Icon from "@/components/ui/Icon";

const PasswordInput = ({ label, name, register, error, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative" style={{ minHeight: '50px' }}> {/* Adjust minHeight as needed */}
      <Textinput
        type={showPassword ? "text" : "password"}
        label={label}
        name={name}
        register={register}
        error={error}
        {...rest}
        className="pr-10"  // Ensure space for the eye icon
      />
      <span
        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        onClick={togglePasswordVisibility}
        style={{ height: '100px' }}  // Adjust height as needed
      >
        <Icon icon={showPassword ? "heroicons-outline:eye-off" : "heroicons-outline:eye"} />
      </span>
    </div>
  );
};

export default PasswordInput;
