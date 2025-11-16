import React from "react";
import { Input } from "@heroui/react";

const FormInput = ({
                       label,
                       type = "text",
                       name,
                       value,
                       onChange,
                       placeholder,
                       error,
                       ...props
                   }) => {
    return (
        <Input
            id={name}
            name={name}
            type={type}
            label={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            variant="bordered"
            size="md"
            isInvalid={!!error}
            errorMessage={error}
            radius="sm"
            fullWidth
            {...props}
        />
    );
};

export default FormInput;
