// Fetch blueprint data from the server
fetch('/blueprints')
    .then(response => response.json())
    .then(data => {
        // Generate blueprint items
        const blueprintsRow = document.getElementById('blueprintsContainer');
        data.forEach(blueprint => {
            const blueprintItem = document.createElement('div');
            blueprintItem.classList.add('blueprint-item');

            // Maak een ankerlink rondom de blueprint
            const link = document.createElement('a');
            link.href = '/blueprints/' + blueprint.id;

            const image = document.createElement('img');
            image.src = 'public/uploads/' + blueprint.image;
            image.alt = 'Blueprint Image';

            const username = document.createElement('p');
            username.textContent = blueprint.username;
            username.classList.add('username');

            link.appendChild(image);
            link.appendChild(username);
            blueprintItem.appendChild(link);
            blueprintsRow.appendChild(blueprintItem);
        });
    })
    .catch(error => {
        console.error('An error occurred while fetching blueprint data:', error);
    });
