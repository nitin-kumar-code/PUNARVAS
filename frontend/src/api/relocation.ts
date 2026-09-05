const API_BASE = 'http://localhost:8000/api/v1';

export const generateRelocationPlan = async (habitationId: string) => {
  const response = await fetch(`${API_BASE}/relocation-plans/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitation_id: habitationId })
  });
  if (!response.ok) throw new Error('Failed to generate relocation plan');
  return response.json();
};

export const fetchSites = async () => {
  const response = await fetch(`${API_BASE}/sites`);
  if (!response.ok) throw new Error('Failed to fetch sites');
  return response.json();
};

export const fetchHabitation = async (id: string) => {
  const response = await fetch(`${API_BASE}/habitations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch habitation');
  return response.json();
};
