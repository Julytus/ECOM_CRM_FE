import type { ReactNode } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { useFieldContext } from "@/components/form/hooks";

type LayoutVariant = "vertical" | "horizontal" | "inline";
type ControlPlacement = "after-content" | "before-content" | "inside-content";
type ErrorStrategy = "touched" | "dirty" | "submit" | "always";

type FieldErrorLike = {
  message?: string;
};

type FieldMeta = {
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitCount?: number;
  errors: (FieldErrorLike | undefined)[];
};

type FieldApi = {
  name: string;
  state: {
    meta: FieldMeta;
  };
};

export type FormControlProps = {
  label: string;
  description?: string;
};

function shouldShowError(strategy: ErrorStrategy, meta: FieldMeta): boolean {
  switch (strategy) {
    case "always":
      return !meta.isValid;
    case "dirty":
      return meta.isDirty && !meta.isValid;
    case "submit":
      return Boolean(meta.submitCount && meta.submitCount > 0 && !meta.isValid);
    default:
      return meta.isTouched && !meta.isValid;
  }
}

type RenderFn = (field: FieldApi) => ReactNode;

type FormBaseProps = FormControlProps & {
  children: ReactNode;
  layout?: LayoutVariant;
  placement?: ControlPlacement;
  errorStrategy?: ErrorStrategy;
  renderLabel?: RenderFn;
  renderDescription?: RenderFn;
  renderError?: RenderFn;
};

export function FormBase({
  children,
  label,
  description,
  layout = "vertical",
  placement = "after-content",
  errorStrategy = "touched",
  renderLabel,
  renderDescription,
  renderError
}: FormBaseProps) {
  const field = useFieldContext() as FieldApi;
  const meta = field.state.meta;

  const isInvalid = shouldShowError(errorStrategy, meta);

  const labelEl = renderLabel?.(field) ?? <FieldLabel htmlFor={field.name}>{label}</FieldLabel>;

  const descEl =
    renderDescription?.(field) ??
    (description ? <FieldDescription>{description}</FieldDescription> : null);

  const errorEl = renderError?.(field) ?? (isInvalid ? <FieldError errors={meta.errors} /> : null);

  switch (placement) {
    case "before-content":
      return (
        <Field
          data-invalid={isInvalid}
          orientation={layout === "horizontal" ? "horizontal" : undefined}
        >
          {children}
          <FieldContent>
            {labelEl}
            {descEl}
          </FieldContent>
          {errorEl}
        </Field>
      );

    case "inside-content":
      return (
        <Field
          data-invalid={isInvalid}
          orientation={layout === "horizontal" ? "horizontal" : undefined}
        >
          <FieldContent>
            {labelEl}
            {children}
            {descEl}
          </FieldContent>
          {errorEl}
        </Field>
      );

    case "after-content":
    default:
      return (
        <Field
          data-invalid={isInvalid}
          orientation={layout === "horizontal" ? "horizontal" : undefined}
        >
          <FieldContent>
            {labelEl}
            {descEl}
          </FieldContent>
          {children}
          {errorEl}
        </Field>
      );
  }
}
