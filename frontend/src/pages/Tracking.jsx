import PageHeader from '../components/PageHeader';
import FluctuationCharts from '../components/FluctuationCharts';
import './Tracking.css';

export default function Tracking() {
    return (
        <div className="tracking-container">
            <PageHeader title="Tu Fluctuación" />
            <div className="tracking-content">
                <div className="grafico-section">
                    <FluctuationCharts />
                </div>
            </div>
        </div>
    );
}
