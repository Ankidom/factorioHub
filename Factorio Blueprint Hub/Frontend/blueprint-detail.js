document.addEventListener('DOMContentLoaded', () => {
    // Get the blueprint id from the URL
    const blueprintId = window.location.pathname.split('/').pop();
    console.log(blueprintId);  // Check of de blueprintId correct wordt opgehaald

    // Fetch blueprint details from the server
    fetch(`/blueprints/${blueprintId}`)
        .then(response => {
            console.log(response);  // Check of de response correct wordt ontvangen
            return response.json();
        })
        .then(data => {
            console.log(data);  // Check of de data correct wordt verwerkt
            const blueprintTitle = document.getElementById('blueprintTitle');
            console.log(blueprintTitle);
            const blueprintImageContainer = document.getElementById('blueprintImageContainer');
            const blueprintUsername = document.getElementById('blueprintUsername');
            const blueprintDate = document.getElementById('blueprintDate');
            const blueprintDescription = document.getElementById('blueprintDescription');

            blueprintTitle.textContent = data.title;
            blueprintUsername.textContent = data.username;
            blueprintDate.textContent = data.dateOfUpload;
            blueprintDescription.textContent = data.blueprintString;

            const image = document.createElement('img');
            image.src = 'public/uploads/' + data.image;
            image.alt = 'Blueprint Image';
            blueprintImageContainer.appendChild(image);
        })
        .catch(error => {
            console.error('An error occurred while fetching blueprint details:', error);
        });
});
