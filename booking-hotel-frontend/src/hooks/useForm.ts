import { useState } from "react";
import { Errors } from "@constant/types";

type ValidateFn<T> = (form: T) => Errors<T>;
type Callback<T> = (form: T) => void;

const useForm = <T>(
  defaultForm: T,
  validate?: ValidateFn<T>,
  callback?: Callback<T>
) => {
  const [form, setForm] = useState<T>(defaultForm);
  const [errors, setErrors] = useState<Errors<T>>({});

  // Dùng cho TextField, TextArea, Select (event.target.name/value)
  const onChangeEvent = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeField = <K extends keyof T>(name: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validate ? validate(form) : {};
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    callback?.(form);
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    onChange: onChangeEvent,
    onChangeField,
    onSubmit,
  };
};

export default useForm;
