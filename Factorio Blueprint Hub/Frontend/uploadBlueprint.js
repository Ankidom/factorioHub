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
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Maak een nieuwe FormData instantie
    const formData = new FormData(e.target);

    // Log de velden in de FormData
    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]);
    }

    try {
        const response = await fetch('/blueprints', {
            method: 'POST',
            body: formData  // Gebruik formData in plaats van JSON.stringify
        });

        if (response.ok) {
            // Server heeft een redirect URL teruggestuurd, dus navigeer daarheen
            window.location.href = response.url;
        } else {
            // Bij een fout, interpreteer het antwoord als tekst en toon het als een foutmelding
            const error = await response.text();
            showErrorMessage(error);
        }
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        showErrorMessage('Er is een fout opgetreden bij het uploaden van de blueprint.');
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
}
