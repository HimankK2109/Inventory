import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";

const InsightsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshLeft, setRefreshLeft] = useState(2);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchInsights = async (force = false) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await axios.get(
        `http://localhost:4000/api/ai/insights${force ? "?force=true" : ""}`
      );

      setData(res.data.insights || []);

      if (res.data?.refreshLeft !== undefined) {
        setRefreshLeft(res.data.refreshLeft);
      }

    } catch (err) {
      console.error(err);

      if (err.response?.status === 429) {
        setErrorMsg("⚠️ You have used all urgent refreshes (2 max)");
        setRefreshLeft(0);
      } else {
        setErrorMsg("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (refreshLeft <= 0) return;
    fetchInsights(true);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground animate-pulse">
          🤖 Generating AI insights...
        </p>
      </div>
    );
  }

  if (!loading && (!data || data.length === 0)) {
    return <p className="p-4">No insights available</p>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Insights</h1>

        <Button
          onClick={handleRefresh}
          disabled={refreshLeft <= 0 || loading}
        >
          ⚡ Refresh ({refreshLeft})
        </Button>
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <p className="text-red-500 text-sm">{errorMsg}</p>
      )}

      {/* ITEMS */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.map((item, idx) => (
          <Card key={idx} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">
                {item.itemName}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Prediction */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Days Left</p>
                  <p className={`text-lg font-bold ${
                    item.prediction?.daysLeft <= 2 ? "text-red-500" : ""
                  }`}>
                    {item.prediction?.daysLeft}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Reorder In</p>
                  <p className="font-semibold">
                    {item.prediction?.reorderInDays} days
                  </p>
                </div>

                <Badge
                  variant={
                    item.prediction?.probability > 80
                      ? "destructive"
                      : item.prediction?.probability > 50
                      ? "secondary"
                      : "default"
                  }
                >
                  {item.prediction?.probability}% Risk
                </Badge>
              </div>

              {/* Consumption */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Avg</p>
                  <p className="font-semibold">
                    {item.consumption?.dailyAvg}
                  </p>
                </div>

                <Badge
                  variant={
                    item.consumption?.trend === "increasing"
                      ? "destructive"
                      : item.consumption?.trend === "decreasing"
                      ? "secondary"
                      : "default"
                  }
                >
                  {item.consumption?.trend?.toUpperCase()}
                </Badge>
              </div>

              {/* Sustainability */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Eco Score</p>
                  <p className="font-semibold">
                    {item.sustainability?.ecoScore}
                  </p>
                </div>

                <Badge variant="outline">
                  {item.sustainability?.wasteRisk}
                </Badge>
              </div>

              {/* Waste Reduced */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Waste Reduced
                </p>
                <p className="text-green-600 font-bold">
                  {item.wasteReduced}%
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                {item.suggestions?.map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-muted text-sm">
                    👉 {s}
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InsightsPage;