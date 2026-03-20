import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const InventoryTable = ({ items }) => {
  return (
    <div className="border rounded-lg p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item, i) => {
            const isLow = item.quantity < item.threshold;

            return (
              <TableRow key={i}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>
                  <Badge variant={isLow ? "destructive" : "default"}>
                    {isLow ? "Low" : "OK"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;