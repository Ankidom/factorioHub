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

async function populateTagsDropdown() {
    const tagsDropdown = document.getElementById('tagsDropdown');

    try {
        const response = await fetch('/available-tags');
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

    if (selectedTagsInput) {
        selectedTagsInput.value += tag.id + ',';
        tagsDropdownButton.textContent = tag.name;
    }
}


document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const selectedTags = document.getElementById('selectedTags').value.split(',').map(tagId => tagId.trim()).filter(tagId => tagId !== '');
    formData.append('tags', JSON.stringify(selectedTags));

    // Log the contents of the FormData object
    for (let pair of formData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]);
    }



    if (selectedTags.length === 0 || (selectedTags.length === 1 && selectedTags[0] === '')) {
        showErrorMessage('Please select at least one tag.');
        return;
    }

    // Verander de naam van de FormData entry van 'tags' naar 'selectedTags'
    formData.append('selectedTags', JSON.stringify(selectedTags));

    try {
        const response = await fetch('/blueprints', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            window.location.href = response.url;
        } else {
            const error = await response.text();
            showErrorMessage(error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        showErrorMessage('An error occurred while uploading the blueprint.');
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

function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('blueprintTitle').value = '';
    document.getElementById('blueprintString').value = '';
    document.getElementById('filename').value = '';
    document.getElementById('tags').value = '';
}
