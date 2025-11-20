import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AppointmentsChart = ({ data }) => {
    // Transformar datos para el gráfico
    const chartData = data.reduce((acc, item) => {
        const month = new Date(item.month).toLocaleDateString('es-PY', { month: 'short', year: 'numeric' });
        const existing = acc.find(d => d.month === month);

        if (existing) {
            existing[item.status] = parseInt(item.count);
        } else {
            acc.push({
                month,
                [item.status]: parseInt(item.count),
            });
        }

        return acc;
    }, []);

    return (
        <div className="chart-container">
            <h3 className="chart-title">Citas por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" name="Pendientes" fill="#f39c12" />
                    <Bar dataKey="confirmed" name="Confirmadas" fill="#3498db" />
                    <Bar dataKey="completed" name="Completadas" fill="#27ae60" />
                    <Bar dataKey="cancelled" name="Canceladas" fill="#e74c3c" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

AppointmentsChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default AppointmentsChart;
