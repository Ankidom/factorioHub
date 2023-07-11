document.addEventListener('DOMContentLoaded', () => {
    let blueprintId = new URLSearchParams(window.location.search).get('id');

    fetch('http://localhost:3000/api/blueprints/' + blueprintId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('blueprintTitle').textContent = data.title;
            document.getElementById('blueprintUsername').textContent = data.username;
            document.getElementById('blueprintDate').textContent = data.dateOfUpload;
            document.getElementById('blueprintDescription').textContent = data.blueprintString;

            const image = document.createElement('img');
            image.src = 'http://localhost:3000/uploads/' + data.image;
            image.alt = 'Blueprint Image';
            document.getElementById('blueprintImageContainer').appendChild(image);
        })
        .catch(error => {
            console.error('An error occurred while fetching blueprint details:', error);
        });

    const deleteButton = document.getElementById('deleteBlueprintButton');

    if(deleteButton) {
        deleteButton.addEventListener('click', () => {
            fetch('http://localhost:3000/api/blueprints/' + blueprintId, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    window.location.href = '/Frontend/index.html';
                })
                .catch(error => {
                    console.error('An error occurred while deleting the blueprint:', error);
                });
        });
    } else {
        console.error("'deleteButton' is not found in the document.");
    }
});
