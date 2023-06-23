let blueprints = [];

// Fetch blueprint data from the server
fetch('/blueprints')
    .then(response => response.json())
    .then(data => {
        blueprints = data;
        displayBlueprints(data);
    })
    .catch(error => {
        console.error('An error occurred while fetching blueprint data:', error);
    });

function displayBlueprints(data) {
    // Clear out the current blueprints
    const blueprintsRow = document.getElementById('blueprintsContainer');
    blueprintsRow.innerHTML = '';

    // Generate blueprint items
    data.forEach(blueprint => {
        const blueprintItem = document.createElement('div');
        blueprintItem.classList.add('blueprint-item');

        // Maak een ankerlink rondom de blueprint
        const link = document.createElement('a');
        link.href = '/blueprint-detail?id=' + blueprint.id;


        const image = document.createElement('img');
        image.src = '/uploads/' + blueprint.image;
        image.alt = 'Blueprint Image';

        const title = document.createElement('p');  // Changed 'username' to 'title'
        title.textContent = blueprint.title;  // Changed 'username' to 'title'
        title.classList.add('title');  // Changed 'username' to 'title'

        link.appendChild(image);
        link.appendChild(title);  // Changed 'username' to 'title'
        blueprintItem.appendChild(link);
        blueprintsRow.appendChild(blueprintItem);
    });
}


// Fetch tags from the server
fetch('/available-tags')
    .then(response => response.json())
    .then(tags => {
        const selectElement = document.getElementById('tagFilter'); // Veranderd van 'tagSelect' naar 'tagFilter'
        tags.forEach(tag => {
            const optionElement = document.createElement('option');
            optionElement.value = tag.id;
            optionElement.textContent = tag.name;
            selectElement.appendChild(optionElement);
        });
    })
    .catch(error => {
        console.error('An error occurred while fetching tags:', error);
    });



document.getElementById('tagFilter').addEventListener('change', (event) => {
    const filterTagId = event.target.value;
    let filteredBlueprints;

    // Check if the selected value is "Select a tag"
    if (filterTagId === '') {
        // If so, display all blueprints
        filteredBlueprints = blueprints;
    } else {
        // Otherwise, filter the blueprints by the selected tag
        filteredBlueprints = blueprints.filter(blueprint => {
            return blueprint.tags.some(tag => tag.id === parseInt(filterTagId));
        });
    }

    displayBlueprints(filteredBlueprints);
});



document.getElementById('titleFilter').addEventListener('input', (event) => {
    const filterText = event.target.value.toLowerCase();
    const filteredBlueprints = blueprints.filter(blueprint => blueprint.title.toLowerCase().includes(filterText));
    displayBlueprints(filteredBlueprints);
});

document.getElementById('tagFilter').addEventListener('input', (event) => {
    const filterTagId = event.target.value;
    console.log(`Selected tag ID: ${filterTagId}`);
    const filterText = event.target.value.toLowerCase();
    const filteredBlueprints = blueprints.filter(blueprint => {
        return blueprint.tags.some(tag => tag.name.toLowerCase().includes(filterText));
    });
    displayBlueprints(filteredBlueprints);
});
