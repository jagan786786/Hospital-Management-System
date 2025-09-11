import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Package, AlertTriangle, Download, Calendar } from "lucide-react";

const monthlyConsumption = [
  { month: "Jan", consumed: 1200, purchased: 1500, value: 18000 },
  { month: "Feb", consumed: 1100, purchased: 1300, value: 16500 },
  { month: "Mar", consumed: 1350, purchased: 1400, value: 20250 },
  { month: "Apr", consumed: 1250, purchased: 1600, value: 18750 },
  { month: "May", consumed: 1400, purchased: 1200, value: 21000 },
  { month: "Jun", consumed: 1300, purchased: 1800, value: 19500 },
];

const categoryDistribution = [
  { name: "Pain Relief", value: 35, color: "hsl(180 70% 40%)" },
  { name: "Antibiotics", value: 25, color: "hsl(180 55% 50%)" },
  { name: "Cardiovascular", value: 20, color: "hsl(180 40% 60%)" },
  { name: "Diabetes", value: 15, color: "hsl(180 25% 70%)" },
  { name: "Others", value: 5, color: "hsl(180 10% 80%)" },
];

const lowStockAlerts = [
  { medicine: "Amoxicillin 250mg", current: 25, minimum: 30, category: "Antibiotic", urgency: "High" },
  { medicine: "Insulin 100IU", current: 8, minimum: 15, category: "Diabetes", urgency: "Critical" },
  { medicine: "Aspirin 75mg", current: 45, minimum: 50, category: "Cardiovascular", urgency: "Medium" },
  { medicine: "Paracetamol 500mg", current: 52, minimum: 60, category: "Pain Relief", urgency: "Low" },
];

export default function StockReports() {
  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      "Critical": "bg-destructive text-destructive-foreground",
      "High": "bg-warning text-warning-foreground", 
      "Medium": "bg-accent text-accent-foreground",
      "Low": "bg-secondary text-secondary-foreground"
    };
    return <Badge className={variants[urgency as keyof typeof variants]}>{urgency}</Badge>;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive inventory insights and consumption patterns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" className="border-border">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$125,680</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">$19,500</div>
            <p className="text-xs text-muted-foreground mt-1">
              1,300 units consumed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">2.4x</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average monthly turnover
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Consumption Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Monthly Consumption vs Purchase
            </CardTitle>
            <CardDescription>Track consumption patterns and purchase trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consumed" fill="hsl(var(--primary))" name="Consumed" />
                <Bar dataKey="purchased" fill="hsl(var(--accent))" name="Purchased" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Inventory by Category
            </CardTitle>
            <CardDescription>Distribution of medicines by therapeutic category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value Trend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Inventory Value Trend
          </CardTitle>
          <CardDescription>Monthly inventory value changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyConsumption}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Inventory Value']} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Items requiring immediate restocking attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">{alert.medicine}</div>
                  <div className="text-sm text-muted-foreground">
                    Category: {alert.category} • Current: {alert.current} • Minimum: {alert.minimum}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Need: {alert.minimum - alert.current} units</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((alert.current / alert.minimum) * 100)}% of minimum stock
                    </div>
                  </div>
                  {getUrgencyBadge(alert.urgency)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}