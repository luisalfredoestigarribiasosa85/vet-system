import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightChart = ({ records }) => {
    // Filtrar registros que tienen peso y ordenar por fecha
    const weightData = records
        .filter(r => r.weight)
        .map(r => ({
            date: new Date(r.createdAt).toLocaleDateString('es-PY', { month: 'short', year: 'numeric' }),
            weight: parseFloat(r.weight),
            fullDate: new Date(r.createdAt),
        }))
        .sort((a, b) => a.fullDate - b.fullDate);

    if (weightData.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolución de Peso</h3>
                <p className="text-gray-500 text-center py-8">No hay datos de peso registrados</p>
            </div>
        );
    }

    // Calcular peso promedio para línea de referencia
    const avgWeight = weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length;

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">Evolución de Peso</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis 
                        label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} kg`, 'Peso']}
                        labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <ReferenceLine
                        y={avgWeight}
                        stroke="#9ca3af"
                        strokeDasharray="3 3"
                        label={{ value: 'Promedio', position: 'right' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
                <div>
                    <span className="font-medium">Peso actual:</span> {weightData[weightData.length - 1].weight} kg
                </div>
                <div>
                    <span className="font-medium">Peso promedio:</span> {avgWeight.toFixed(1)} kg
                </div>
            </div>
        </div>
    );
};

WeightChart.propTypes = {
    records: PropTypes.array.isRequired,
};

export default WeightChart;
