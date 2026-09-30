import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext } from "@/components/form/hooks";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReactNode } from "react";

type FormSelectProps = FormControlProps & {
  children: ReactNode;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function FormSelect({ children, onValueChange, ...props }: FormSelectProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleValueChange = (value: string) => {
    field.handleChange(value);
    onValueChange?.(value);
  };

  return (
    <FormBase {...props}>
      <Select onValueChange={handleValueChange} value={field.state.value} disabled={props.disabled}>
        <SelectTrigger
          aria-invalid={isInvalid}
          id={field.name}
          onBlur={field.handleBlur}
          className="w-full"
        >
          <SelectValue placeholder={props.placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormBase>
  );
}
