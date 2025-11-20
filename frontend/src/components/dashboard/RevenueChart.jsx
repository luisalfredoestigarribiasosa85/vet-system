import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const RevenueChart = ({ data }) => {
    // Transformar datos para el gráfico
    const chartData = data.map(item => ({
        month: new Date(item.month).toLocaleDateString('es-PY', { month: 'short', year: 'numeric' }),
        total: parseFloat(item.total),
    }));

    // Formatear moneda
    const formatCurrency = (value) => {
        return `₲ ${value.toLocaleString()}`;
    };

    return (
        <div className="chart-container">
            <h3 className="chart-title">Ingresos Mensuales</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#27ae60" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={formatCurrency} />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#27ae60"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Ingresos"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

RevenueChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default RevenueChart;
