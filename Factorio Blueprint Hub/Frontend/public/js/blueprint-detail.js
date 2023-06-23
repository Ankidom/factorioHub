// blueprint-detail.js
document.addEventListener('DOMContentLoaded', () => {
    const blueprintId = new URLSearchParams(window.location.search).get('id');

    fetch('/api/blueprints/' + blueprintId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('blueprintTitle').textContent = data.title;
            console.log(data.title);
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
});
