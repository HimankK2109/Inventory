import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.enum([
    "Milk",
    "Coffee Beans",
    "Tea Leaves",
    "Sugar",
    "Bread",
    "Butter",
    "Cheese",
    "Chocolate Syrup",
  ]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.enum(["L", "Kg", "pcs"]),
});

const InventoryForm = ({ onAdd }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: undefined,
      quantity: undefined,
      unit: undefined,
    },
  });

  const selectedName = watch("name");
  const selectedUnit = watch("unit");

  const onSubmit = async (data) => {
    const success = await onAdd(data);
    if (success) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
      
      {/* Product */}
      <div className="col-span-2">
        <Label>Item Name</Label>
        <Select
          value={selectedName || ""}
          onValueChange={(value) =>
            setValue("name", value, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Milk">Milk</SelectItem>
            <SelectItem value="Coffee Beans">Coffee Beans</SelectItem>
            <SelectItem value="Tea Leaves">Tea Leaves</SelectItem>
            <SelectItem value="Sugar">Sugar</SelectItem>
            <SelectItem value="Bread">Bread</SelectItem>
            <SelectItem value="Butter">Butter</SelectItem>
            <SelectItem value="Cheese">Cheese</SelectItem>
            <SelectItem value="Chocolate Syrup">Chocolate Syrup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div>
        <Label>Quantity</Label>
        <Input
          type="number"
          {...register("quantity", { valueAsNumber: true })}
        />
      </div>

      {/* Unit */}
      <div>
        <Label>Unit</Label>
        <Select
          value={selectedUnit || ""}
          onValueChange={(value) =>
            setValue("unit", value, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="Kg">Kg</SelectItem>
            <SelectItem value="pcs">pcs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="col-span-2">
        Add / Update
      </Button>
    </form>
  );
};

export default InventoryForm;