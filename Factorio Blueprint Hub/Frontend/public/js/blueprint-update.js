document.addEventListener('DOMContentLoaded', () => {
    let blueprintId = new URLSearchParams(window.location.search).get('id');

    fetch('/api/blueprints/' + blueprintId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('title').value = data.title;
            document.getElementById('blueprintString').value = data.blueprintString;
            // For the image, you may need to handle this differently based on your application
        })
        .catch(error => {
            console.error('An error occurred while fetching blueprint details:', error);
        });

    const updateBlueprintForm = document.getElementById('updateBlueprintForm');
    updateBlueprintForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let title = document.getElementById('title').value;
        let blueprintString = document.getElementById('blueprintString').value;
        // For the image, you may need to handle this differently based on your application

        const updatedData = {
            title: document.getElementById('title').value,
            blueprintString: document.getElementById('blueprintString').value,
            image: '<vul hier de gegevens in voor de afbeelding>', // Mogelijk moet je de gegevens voor de afbeelding verkrijgen van een bestandselement op de pagina
        };


        fetch('/api/blueprints/' + blueprintId, {
            method: 'PUT', // or 'PATCH' if you only want to update specific fields
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
