import { atom } from "jotai";

export const selectedProductIdAtom = atom<number | null>(null);
export const productSheetOpenAtom = atom(false);
export const selectedVariantIdAtom = atom<number | null>(null);
