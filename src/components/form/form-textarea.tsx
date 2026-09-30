import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext } from "@/components/form/hooks";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps = FormControlProps & {
  placeholder?: string;
};

export function FormTextarea(props: FormTextareaProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props} placement="after-content">
      <Textarea
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
