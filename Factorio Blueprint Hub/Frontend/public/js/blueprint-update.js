document.addEventListener('DOMContentLoaded', () => {
    let blueprintId = new URLSearchParams(window.location.search).get('id');

    fetch('/api/blueprints/' + blueprintId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('title').value = data.title;
            document.getElementById('blueprintString').value = data.blueprintString;
        })
        .catch(error => {
            console.error('An error occurred while fetching blueprint details:', error);
        });

    const updateBlueprintForm = document.getElementById('updateBlueprintForm');
    updateBlueprintForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let title = document.getElementById('title').value;
        let blueprintString = document.getElementById('blueprintString').value;

        const updatedData = {
            title,
            blueprintString
        };

        fetch('/api/blueprints/' + blueprintId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                window.location.href = '/blueprint-detail.html?id=' + blueprintId;
            })
            .catch(error => {
                console.error('An error occurred while updating the blueprint:', error);
            });
    });
});