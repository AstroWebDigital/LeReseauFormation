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
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="text-sm font-medium text-default-500"
                >
                    {label}
                </label>
            )}

            <Input
                id={name}
                name={name}
                type={type}
                /* pas de label ici → pas de label flottant qui se superpose */
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                variant="bordered"
                size="md"
                radius="sm"
                fullWidth
                isInvalid={!!error}
                errorMessage={error}
                {...props}
            />
        </div>
    );
};

export default FormInput;
