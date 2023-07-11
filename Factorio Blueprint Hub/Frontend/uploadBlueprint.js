window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const message = urlParams.get('message');

    if (message) {
        if (success === 'true') {
            showSuccessMessage(decodeURIComponent(message));
        } else {
            showErrorMessage(decodeURIComponent(message));
        }
    }
    populateTagsDropdown();
}

let selectedTags = [];

async function populateTagsDropdown() {
    const tagsDropdown = document.getElementById('tagsDropdown');

    try {
        const response = await fetch('http://localhost:3000/available-tags');
        const tags = await response.json();

        tags.forEach(tag => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a class="dropdown-item" href="#" data-tag-id="${tag.id}">${tag.name}</a>`;
            listItem.addEventListener('click', (event) => {
                event.preventDefault();
                addTagToInput(tag);
            });
            tagsDropdown.appendChild(listItem);
        });
    } catch (error) {
        console.error('An error occurred while fetching available tags:', error);
    }
}

function addTagToInput(tag) {
    const selectedTagsInput = document.getElementById('selectedTags');
    const tagsDropdownButton = document.getElementById('tagsDropdownButton');

    if (!selectedTags.includes(tag.id)) {
        selectedTags.push(tag.id);
        selectedTagsInput.value = selectedTags.join(',');
        tagsDropdownButton.textContent = tag.name;
    }
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const selectedTags = document.getElementById('selectedTags').value.split(',');

    formData.append('tags', JSON.stringify(selectedTags));

    try {
        const response = await fetch('http://localhost:3000/blueprints', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/Frontend/index.html';
        } else {
            const error = await response.text();
            console.error('An error occurred:', error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
});


function showSuccessMessage(message) {
    const uploadMessage = document.getElementById('uploadMessage');
    uploadMessage.innerHTML = `
        <div class="alert alert-success" role="alert">
            ${message}
        </div>
    `;
}

function showErrorMessage(message) {
    const uploadMessage = document.getElementById('uploadMessage');
    uploadMessage.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
}
