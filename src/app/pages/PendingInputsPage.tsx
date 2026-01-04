import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { pendingInputsAtom, isLoadingInputsAtom } from '../state/inputsState';
import { InputsService, PendingInput } from '../services/InputsService';

const PendingInputsPage: React.FC = () => {
  const [inputs, setInputs] = useAtom(pendingInputsAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingInputsAtom);

  useEffect(() => {
    const fetchInputs = async () => {
      setIsLoading(true);
      try {
        const data = await InputsService.getPendingInputs();
        setInputs(data);
      } catch (error) {
        console.error('Error fetching inputs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInputs();
  }, [setInputs, setIsLoading]);

  const handleResolve = async (input: PendingInput) => {
    // Basic logic to demonstrate resolution
    const inputData: Record<string, string> = {};
    for (const field of input.required_fields || []) {
        const val = prompt(`Enter ${field}:`);
        if (val === null) return;
        inputData[field] = val;
    }

    try {
        const success = await InputsService.resolveInput({
            activity_id: input.activity_id,
            input_data: inputData,
        });
        if (success) {
            alert('Resolved successfully!');
            setInputs(prev => prev.filter(i => i.id !== input.id));
        }
    } catch (error) {
        alert('Failed to resolve input');
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span class="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => window.location.href = '/app/'} className="btn text">Back to Dashboard</button>
        </div>
      </header>
      <main className="dashboard">
        <h2>Pending Inputs</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : inputs.length === 0 ? (
          <p>No pending inputs found.</p>
        ) : (
          <div className="inputs-list">
            {inputs.map(input => (
              <div key={input.id} className="card">
                <h3>Activity: {input.activity_id}</h3>
                <p>Status: {input.status === 1 ? 'WAITING' : 'COMPLETED'}</p>
                <p>Required Fields: {input.required_fields?.join(', ')}</p>
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
