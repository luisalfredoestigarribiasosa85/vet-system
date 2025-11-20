import PropTypes from 'prop-types';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color = '#3498db', subtitle }) => {
    return (
        <div className="stats-card" style={{ borderLeftColor: color }}>
            <div className="stats-card-header">
                <div className="stats-card-icon" style={{ backgroundColor: `${color}20`, color }}>
                    {icon}
                </div>
                <div className="stats-card-content">
                    <h3 className="stats-card-title">{title}</h3>
                    <p className="stats-card-value">{value}</p>
                    {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string,
    subtitle: PropTypes.string,
};

export default StatsCard;
