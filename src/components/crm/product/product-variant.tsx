import { Button } from "@/components/ui/button";
import type { ProductDetailsDTO } from "@/lib/types/product";

export function VariantList({ product }: { product: ProductDetailsDTO }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Button size="sm">Add Variant</Button>
      </div>

      <div className="divide-y rounded-md border">
        {product.variants?.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-3">
            <div>{v.sku}</div>
            <div className="text-muted-foreground">{v.sku}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
