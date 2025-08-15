// utils/api.js
export const getTaskSuggestions = async (taskData) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/ai/suggest/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFTOKEN': 'YOUR_CSRF_TOKEN', // Replace with your CSRF token if needed
            },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            throw new Error('Failed to generate task suggestion');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error while getting task suggestions:', error);
    }
};
