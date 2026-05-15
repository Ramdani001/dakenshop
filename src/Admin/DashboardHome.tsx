import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie, Legend
} from "recharts";

// Data Dummy untuk Grafik Penjualan (Area Chart)
const salesData = [
  { name: "Dec 07", sales: 150 },
  { name: "Dec 14", sales: 180 },
  { name: "Dec 17", sales: 210 },
  { name: "Dec 27", sales: 175 },
  { name: "Dec 30", sales: 230 },
];

// Data Dummy untuk User Terdaftar (Bar Chart)
const userData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 150 },
  { month: "Mar", users: 180 },
  { month: "Apr", users: 160 },
  { month: "May", users: 210 },
  { month: "Jun", users: 250 },
];

// Data Dummy untuk Produk Terlaris (Pie Chart)
const productData = [
  { name: "Classic Tee", value: 35, color: "#3B82F6" },
  { name: "Wireless Pods", value: 25, color: "#10B981" },
  { name: "Canvas Backpack", value: 20, color: "#F59E0B" },
  { name: "Others", value: 20, color: "#6366F1" },
];

const DashboardHome: React.FC = () => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold m-0">Dashboard Overview</h2>
        <p className="text-muted">Your summary of sales, users, and top products</p>
      </div>

      <Row className="g-4">
        {/* 1. Grafik Penjualan (Area Chart) */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Gross Sales Performance</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 2. Statistik User Baru (Bar Chart) */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">New Registered Users</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 3. Grafik Produk Terlaris (Pie Chart) */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Best Selling Products</h5>
            <div className="d-flex align-items-center justify-content-center" style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={productData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 4. Quick Stats / Recent Activity */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Quick Stats</h5>
            <Row className="g-3">
              {[
                { label: "Total Products", value: "1,540", color: "#3B82F6" },
                { label: "Active Categories", value: "32", color: "#10B981" },
                { label: "Active Promos", value: "8", color: "#F59E0B" },
                { label: "Pending Orders", value: "12", color: "#EF4444" },
              ].map((item, i) => (
                <Col xs={6} key={i}>
                  <div className="p-3 border rounded-3" style={{ backgroundColor: "#F8FAFC" }}>
                    <small className="text-muted d-block mb-1">{item.label}</small>
                    <h4 className="fw-bold m-0" style={{ color: item.color }}>{item.value}</h4>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;