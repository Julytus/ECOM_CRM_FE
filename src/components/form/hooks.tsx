import { FormCheckbox } from "@/components/form/form-checkbox";
import { FormInput } from "@/components/form/form-input";
import { FormPassword } from "@/components/form/form-password";
import { FormSelect } from "@/components/form/form-select";
import { FormTextarea } from "@/components/form/form-textarea";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Password: FormPassword,
    Textarea: FormTextarea,
    Select: FormSelect,
    Checkbox: FormCheckbox
  },
  formComponents: {},
  fieldContext,
  formContext
});

export { useAppForm, useFieldContext, useFormContext };
