import PropTypes from 'prop-types';

const SurgeriesSection = ({ surgeries }) => {
    if (!surgeries || surgeries.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cirugías</h3>
                <p className="text-gray-500 text-center py-4">No hay cirugías registradas</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Cirugías</h3>

            <div className="space-y-4">
                {surgeries.map((surgery, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🏥</span>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-lg text-gray-800">{surgery.name}</h4>
                                    {surgery.date && (
                                        <span className="text-sm text-gray-500">
                                            {new Date(surgery.date).toLocaleDateString('es-PY')}
                                        </span>
                                    )}
                                </div>

                                {surgery.vetName && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Veterinario: <span className="font-medium">{surgery.vetName}</span>
                                    </p>
                                )}

                                {surgery.notes && (
                                    <p className="text-sm text-gray-600 mt-2 italic">{surgery.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

SurgeriesSection.propTypes = {
    surgeries: PropTypes.array,
};

export default SurgeriesSection;
