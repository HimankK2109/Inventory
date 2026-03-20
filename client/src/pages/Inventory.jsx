import { useEffect, useState } from "react";
import InventoryForm from "../components/InventoryForm"
import InventoryTable from "../components/InventoryTable";
import axios from "axios"

const Inventory = () => {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/listInventory");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Form submit handler
  const handleAdd = async (formData) => {

    try {
      const res = await axios.post(
        "http://localhost:4000/api/addInventory",
        formData
      );

      fetchItems();
      return true;
    } catch (err) {
      console.error("ERROR:", err);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <InventoryForm onAdd={handleAdd} />
      <InventoryTable items={items} />
    </div>
  );
};

export default Inventory;