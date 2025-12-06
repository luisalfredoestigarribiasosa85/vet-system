import PropTypes from 'prop-types';

const AllergiesSection = ({ allergies }) => {
    if (!allergies || allergies.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alergias</h3>
                <p className="text-gray-500 text-center py-4">No hay alergias registradas</p>
            </div>
        );
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'grave':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'moderada':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'leve':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'grave':
                return '🚨';
            case 'moderada':
                return '⚠️';
            case 'leve':
                return '⚡';
            default:
                return '📌';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">Alergias Conocidas</h3>

            <div className="space-y-3">
                {allergies.map((allergy, index) => (
                    <div
                        key={index}
                        className={`border-2 rounded-lg p-3 sm:p-4 ${getSeverityColor(allergy.severity)}`}
                    >
                        <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{getSeverityIcon(allergy.severity)}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base sm:text-lg">{allergy.name}</h4>
                                <p className="text-xs sm:text-sm capitalize mt-1">
                                    Severidad: <span className="font-medium">{allergy.severity}</span>
                                </p>
                                {allergy.notes && (
                                    <p className="text-xs sm:text-sm mt-2 italic">{allergy.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

AllergiesSection.propTypes = {
    allergies: PropTypes.array,
};

export default AllergiesSection;
