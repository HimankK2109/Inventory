import { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import MultiLineChart from "../components/UsageChart";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!data) return <p className="p-4">Loading dashboard...</p>;

  const {
    totalItems,
    lowStock,
    wasteReduced,
    topItems,
    allItems,
    graphData,
  } = data || {};

  const alertItems = allItems?.filter((i) =>
    ["CRITICAL", "HIGH"].includes(i.rushAlert?.severity)
  );

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p>Total Items</p>
          <h2 className="text-xl font-bold">{totalItems}</h2>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p>Low Stock</p>
          <h2 className="text-xl font-bold text-red-500">{lowStock}</h2>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p>Waste Reduced</p>
          <h2 className="text-xl font-bold text-green-500">
            {wasteReduced !== null ? `${wasteReduced}%` : "N/A"}
          </h2>
        </CardContent></Card>
      </div>

      {/* Alerts (ALL items) */}
      {alertItems?.length > 0 &&
        alertItems.map((item, idx) => (
          <Alert key={idx}>
            {item.rushAlert?.message}
          </Alert>
        ))
      }

      {/* Graph */}
      <MultiLineChart data={graphData} />

      {/* Table (Top 3 only) */}
      <Card>
        <CardContent className="p-4">
          <h2 className="mb-4 font-semibold">Inventory</h2>

          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th>Item</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {topItems.map((item, i) => (
                <tr key={i} className="border-t">
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <Badge
                      variant={
                        item.rushAlert?.severity === "CRITICAL"
                          ? "destructive"
                          : item.rushAlert?.severity === "HIGH"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {item.rushAlert?.severity || "OK"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;