import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const VaccinationsChart = ({ data }) => {
    // Transformar datos para el gráfico
    const chartData = data.map(item => ({
        name: item.status === 'aplicada' ? 'Aplicadas' :
            item.status === 'próxima' ? 'Próximas' : 'Vencidas',
        value: parseInt(item.count),
        status: item.status,
    }));

    const COLORS = {
        'aplicada': '#27ae60',
        'próxima': '#f39c12',
        'vencida': '#e74c3c',
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="chart-container">
            <h3 className="chart-title">Distribución de Vacunas</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

VaccinationsChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default VaccinationsChart;
