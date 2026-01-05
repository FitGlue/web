import { useInputs } from '../hooks/useInputs';
import { InputsService, PendingInput } from '../services/InputsService';
import { useNavigate } from 'react-router-dom';

const PendingInputsPage: React.FC = () => {
  const { inputs, loading, refresh } = useInputs();
  const navigate = useNavigate();

  const handleResolve = async (input: PendingInput) => {
    // Basic logic to demonstrate resolution
    const inputData: Record<string, string> = {};
    for (const field of input.requiredFields || []) {
        const val = prompt(`Enter ${field}:`);
        if (val === null) return;
        inputData[field] = val;
    }

    try {
        const success = await InputsService.resolveInput({
            activityId: input.activityId,
            inputData: inputData,
        });
        if (success) {
            alert('Resolved successfully!');
            refresh(); // Refresh total list
        }
    } catch (error) {
        alert('Failed to resolve input');
    }
  };

  return (
    <div className="container dashboard-container">
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => navigate('/')} className="btn text">Back to Dashboard</button>
        </div>
      </header>
      <main className="dashboard">
        <h2>Pending Inputs</h2>
        {loading && inputs.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching your activities...</p>
          </div>
        ) : inputs.length === 0 ? (
          <p>No pending inputs found.</p>
        ) : (
          <div className="inputs-list">
            {inputs.map(input => (
              <div key={input.id} className="card">
                <h3>Activity: {input.activityId}</h3>
                <p>Status: {input.status === 1 ? 'WAITING' : 'COMPLETED'}</p>
                <p>Required Fields: {input.requiredFields?.join(', ')}</p>
                <button onClick={() => handleResolve(input)} className="btn primary">Resolve</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingInputsPage;
