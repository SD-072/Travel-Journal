import type { Dispatch, RefObject, SetStateAction } from 'react';
export type DbEntry = {
  _id: string;
  createdAt: string;
  updatedAt?: string;
  __v: number;
};

export type PostInput = {
  title: string;
  image: string;
  content: string;
};

export type DbPost = DbEntry & PostInput & { author: string };

export type SetPost = Dispatch<SetStateAction<DbPost | null>>;
export type SetPosts = Dispatch<SetStateAction<DbPost[]>>;

export type ModalRef = RefObject<HTMLDialogElement | null>;

export type User = {
  _id: string;
  createdAt: string;
  __v: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export type LoginInput = { email: string; password: string };

export type AuthContextType = {
  signedIn: boolean;
  user: User | null;
  handleSignIn: ({ email, password }: LoginInput) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleRegister: (formData: RegisterFormState) => Promise<void>;
};

export type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
