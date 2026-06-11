import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import CONFIG from "../Config.ts";

interface DashboardData {
  salesData: Array<{ name: string; sales: number }>;
  userData: Array<{ month: string; users: number }>;
  productData: Array<{ name: string; value: number; color: string }>;
  quickStats: {
    totalProducts: string;
    activeCategories: string;
    activePromos: string;
    pendingOrders: string;
  };
}

const DashboardHome: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(CONFIG.BASE_URL + "/api/dashboard/stats");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center mt-5 text-danger">Data gagal dimuat dari server database.</div>;
  }

  // Amankan data: jika properti dari API bernilai null/undefined, otomatis jadi array kosong []
  const salesData = data.salesData || [];
  const userData = data.userData || [];
  const productData = data.productData || [];
  const quickStats = data.quickStats || {
    totalProducts: "0",
    activeCategories: "0",
    activePromos: "0",
    pendingOrders: "0"
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold m-0">Dashboard Overview</h2>
        <p className="text-muted">Your summary of sales, users, and top products</p>
      </div>

      <Row className="g-4">
        {/* 1. Area Chart Penjualan Rentang 1 Bulan */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Gross Sales Performance</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                {/* Grafik tetap dirender meskipun salesData kosong */}
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

        {/* 2. Bar Chart User Terdaftar Rentang 1 Bulan */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">New Registered Users</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                {/* Grafik tetap dirender meskipun userData kosong */}
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 3. Ring Pie Chart Best Selling Products Keseluruhan */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Best Selling Products</h5>
            <div className="d-flex align-items-center justify-content-center" style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                {productData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={productData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color || "#3B82F6"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                ) : (
                  // Cadangan lingkaran kosong abu-abu estetis jika data produk benar-benar belum ada
                  <PieChart>
                    <Pie
                      data={[{ name: "No Data", value: 1 }]}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      <Cell fill="#E2E8F0" />
                    </Pie>
                    <Tooltip formatter={() => "0"} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* 4. Quick Stats Dinamis */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold mb-4">Quick Stats</h5>
            <Row className="g-3">
              {[
                { label: "Total Products", value: quickStats.totalProducts || "0", color: "#3B82F6" },
                { label: "Active Categories", value: quickStats.activeCategories || "0", color: "#10B981" },
                { label: "Active Promos", value: quickStats.activePromos || "0", color: "#F59E0B" },
                { label: "Pending Orders", value: quickStats.pendingOrders || "0", color: "#EF4444" },
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