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
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">Historial de Cirugías</h3>

            <div className="space-y-4">
                {surgeries.map((surgery, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition"
                    >
                        <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">🏥</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                                    <h4 className="font-semibold text-base sm:text-lg text-gray-800">{surgery.name}</h4>
                                    {surgery.date && (
                                        <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                            {new Date(surgery.date).toLocaleDateString('es-PY')}
                                        </span>
                                    )}
                                </div>

                                {surgery.vetName && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        Veterinario: <span className="font-medium">{surgery.vetName}</span>
                                    </p>
                                )}

                                {surgery.notes && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">{surgery.notes}</p>
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
