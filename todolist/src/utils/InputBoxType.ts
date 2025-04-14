import { ChangeEvent } from "react";

export type InputBoxProps = {
  title: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon:
    | "email"
    | "password"
    | "key"
    | "user"
    | "title"
    | "description"
    | "image"
    | "number";
  height: "small" | "medium" | "large";
};
