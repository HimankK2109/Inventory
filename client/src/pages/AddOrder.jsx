import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

// Schema
const orderSchema = z.object({
  product: z.enum(["Coffee", "Tea", "Latte", "Sandwich", "CheeseToast"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(1, "Price must be positive"),
  customer: z.string().min(1, "Customer name is required"),
});

const AddOrder = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product: "",
      quantity: undefined,
      price: undefined,
      customer: "",
    },
  });

  const selectedProduct = watch("product");

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:4000/api/addOrder",
        data
      );

      reset();

      alert("Order placed successfully!");

    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-10 px-4">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        
        {/* Header */}
        <CardHeader>
          <CardTitle className="text-2xl">Add Order</CardTitle>
          <CardDescription>
            Record a new order and update inventory automatically
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-1 col-span-2">
                <Label>Product</Label>
                <Select
                  value={selectedProduct || ""}
                  onValueChange={(value) =>
                    setValue("product", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coffee">Coffee</SelectItem>
                    <SelectItem value="Tea">Tea</SelectItem>
                    <SelectItem value="Latte">Latte</SelectItem>
                    <SelectItem value="Sandwich">Sandwich</SelectItem>
                    <SelectItem value="CheeseToast">CheeseToast</SelectItem>
                  </SelectContent>
                </Select>
                {errors.product && (
                  <p className="text-xs text-red-500">
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <Label>Total Price</Label>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="Enter total price"
                />
                {errors.price && (
                  <p className="text-xs text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Customer */}
              <div className="space-y-1 col-span-2">
                <Label>Customer Name</Label>
                <Input
                  {...register("customer")}
                  placeholder="Enter customer name"
                />
                {errors.customer && (
                  <p className="text-xs text-red-500">
                    {errors.customer.message}
                  </p>
                )}
              </div>

            </div>

            {/* Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Order"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOrder;