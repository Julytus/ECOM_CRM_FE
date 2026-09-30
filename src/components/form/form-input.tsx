import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext } from "@/components/form/hooks";
import { Input } from "@/components/ui/input";
import type { Prettify } from "@/lib/types/common";

type FormInputControlProps = Prettify<FormControlProps & { placeholder?: string }>;

export function FormInput(props: FormInputControlProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={props.placeholder}
      />
    </FormBase>
  );
}
