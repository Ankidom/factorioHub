document.addEventListener('DOMContentLoaded', () => {
    let blueprintId = new URLSearchParams(window.location.search).get('id');

    fetch('/api/blueprints/' + blueprintId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('blueprintTitle').textContent = data.title;
            document.getElementById('blueprintUsername').textContent = data.username;
            document.getElementById('blueprintDate').textContent = data.dateOfUpload;
            document.getElementById('blueprintDescription').textContent = data.blueprintString;

            const image = document.createElement('img');
            image.src = '/uploads/' + data.image;
            image.alt = 'Blueprint Image';
            document.getElementById('blueprintImageContainer').appendChild(image);
        })
        .catch(error => {
            console.error('An error occurred while fetching blueprint details:', error);
        });

    const deleteButton = document.getElementById('deleteBlueprintButton');

// In your blueprint-detail.js file, add a click event to the 'Edit Blueprint' button

    const editButton = document.getElementById('editBlueprintButton');

    if(editButton) {
        editButton.addEventListener('click', () => {
            window.location.href = '/blueprint-update.html?id=' + blueprintId;
        });
    } else {
        console.error("'editButton' is not found in the document.");
    }

    if(deleteButton) {
        deleteButton.addEventListener('click', () => {
            fetch('/api/blueprints/' + blueprintId, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    window.location.href = '/index.html';
                })
                .catch(error => {
                    console.error('An error occurred while deleting the blueprint:', error);
                });
        });
    } else {
        console.error("'deleteButton' is not found in the document.");
    }
});
