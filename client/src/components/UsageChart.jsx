import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const MultiLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line type="monotone" dataKey="Milk" stroke="#3b82f6" />
        <Line type="monotone" dataKey="Coffee Beans" stroke="#10b981" />
        <Line type="monotone" dataKey="Sugar" stroke="#f59e0b" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MultiLineChart;