import type { CartItem } from "@/lib/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];

  addToCart: (productId: number, variantId: number, quantity?: number, maxStock?: number) => void;
  removeFromCart: (productId: number, variantId: number) => void;
  updateQuantity: (productId: number, variantId: number, quantity: number) => void;
  incrementQuantity: (productId: number, variantId: number) => void;
  decrementQuantity: (productId: number, variantId: number) => void;

  updateSelect: (productId: number, variantId: number, value: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;

  clearCart: () => void;
  clearSelected: () => void;

  getQuantity: (productId: number, variantId: number) => number;
  getTotalItems: () => number;
  getSelectedItems: () => CartItem[];
  getSelectedTotalItems: () => number;
  getProductVariantKeys: () => Array<{ productId: number; variantId: number }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (productId, variantId, quantity, maxStock) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === productId && i.variantId === variantId
          );

          const addedQty = quantity ?? 1;

          if (existing) {
            const newQuantity = existing.quantity + addedQty;
            const shouldDeselect = maxStock !== undefined && newQuantity > maxStock;

            return {
              items: state.items.map((item) =>
                item.productId === productId && item.variantId === variantId
                  ? {
                      ...item,
                      quantity: newQuantity,
                      selected: shouldDeselect ? false : true
                    }
                  : item
              )
            };
          }

          return {
            items: [...state.items, { productId, variantId, quantity: addedQty, selected: true }]
          };
        }),

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          )
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        })),

      incrementQuantity: (productId, variantId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        })),

      decrementQuantity: (productId, variantId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        })),

      updateSelect: (productId, variantId, value) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, selected: value }
              : item
          )
        })),

      selectAll: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: true }))
        })),

      deselectAll: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: false }))
        })),

      clearCart: () => set({ items: [] }),

      clearSelected: () => {
        set({
          items: get().items.filter((item) => !item.selected)
        });
      },

      getQuantity: (productId, variantId) => {
        const item = get().items.find(
          (i) => i.productId === productId && i.variantId === variantId
        );
        return item?.quantity ?? 0;
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSelectedItems: () => {
        return get().items.filter((item) => item.selected);
      },

      getSelectedTotalItems: () => {
        return get()
          .items.filter((item) => item.selected)
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      getProductVariantKeys: () => {
        return get().items.map(({ productId, variantId }) => ({ productId, variantId }));
      }
    }),
    {
      name: "cart-storage"
    }
  )
);
