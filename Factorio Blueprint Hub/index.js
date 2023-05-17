function decodeBlueprintString(blueprintString) {
    // Remove the '0' prefix from the blueprint string
    blueprintString = blueprintString.slice(1);

    // Decode the base64 encoded string
    const decodedData = atob(blueprintString);

    // Convert the decoded data to a Uint8Array
    const uint8Array = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
        uint8Array[i] = decodedData.charCodeAt(i);
    }

    // Decompress the data using pako
    const decompressedData = pako.inflate(uint8Array, {to: 'string'});

    // Parse the JSON data
    const blueprintData = JSON.parse(decompressedData);

    return blueprintData;
}

function getBlueprintRequirements(blueprintString) {
    const blueprintData = decodeBlueprintString(blueprintString);

    // Check if the blueprint has entities
    if (!blueprintData.blueprint || !blueprintData.blueprint.entities) {
        return {};
    }

    const entities = blueprintData.blueprint.entities;

    // Initialize a dictionary to store the requirements
    const requirements = {};

    // Iterate through the entities and add their count to the requirements dictionary
    entities.forEach((entity) => {
        const entityName = entity.name;
        if (!requirements.hasOwnProperty(entityName)) {
            requirements[entityName] = 0;
        }
        requirements[entityName]++;
    });

    return requirements;
}

document.getElementById('calculateButton').addEventListener('click', () => {
    const blueprintString = document.getElementById('blueprintString').value;
    const requirements = getBlueprintRequirements(blueprintString);

    // Update the table with the new requirements
    const table = document.getElementById('requirementsTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    for (const [entity, count] of Object.entries(requirements)) {
        const row = document.createElement('tr');
        const entityCell = document.createElement('td');
        const countCell = document.createElement('td');

        entityCell.textContent = entity;
        countCell.textContent = count;

        row.appendChild(entityCell);
        row.appendChild(countCell);
        tbody.appendChild(row);
    }

    table.style.display = 'table';
});