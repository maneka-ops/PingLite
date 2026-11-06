const form = document.getElementById('checkerForm');

const input = document.getElementById('websiteUrl');

const button = document.getElementById('checkButton');

const buttonText = document.getElementById('buttonText');

const buttonLoader = document.getElementById('buttonLoader');

const resultSection = document.getElementById('resultSection');

const statusBadge = document.getElementById('statusBadge');

const errorMessage = document.getElementById('errorMessage');

let activeController = null;


form.addEventListener('submit', async (event) => {

    event.preventDefault();

    let url = input.value.trim();

    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    try {
        const parsed = new URL(url);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Only HTTP and HTTPS are supported.');
        }

        if (parsed.username || parsed.password) {
            throw new Error('URL credentials are not allowed.');
        }

        url = parsed.href;

    } catch (error) {
        showError(error.message || 'Please enter a valid website URL.');
        return;
    }

    if (activeController) {
        activeController.abort();
    }

    activeController = new AbortController();

    const controller = activeController;

    setLoading(true);

    try {

        const response = await fetch(
            `/api/v1/check?url=${encodeURIComponent(url)}`,
            {
                signal: controller.signal
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Website check failed.');
        }

        if (activeController !== controller) return;

        displayResult(result.data);

    } catch (error) {

        if (error.name === 'AbortError') return;

        if (activeController !== controller) return;

        showError(error.message || 'Unable to check website.');

    } finally {

        if (activeController === controller) {
            activeController = null;
            setLoading(false);
        }

    }

});


function setLoading(loading) {

    button.disabled = loading;

    buttonText.textContent = loading
        ? 'Checking...'
        : 'Check website';

    buttonLoader.classList.toggle('hidden', !loading);

}


function showError(message) {

    resultSection.classList.remove('hidden');

    statusBadge.textContent = 'ERROR';

    statusBadge.className = 'status-badge offline';

    errorMessage.textContent = message;

    errorMessage.classList.remove('hidden');

    document.getElementById('resultWebsite').textContent =
        'Unable to check website';

    document.getElementById('httpStatus').textContent = '--';

    document.getElementById('statusText').textContent = 'Unavailable';

    document.getElementById('responseTime').textContent = '--';

    document.getElementById('protocol').textContent = '--';

    document.getElementById('checkedAt').textContent = 'Just now';

}


function displayResult(data) {

    resultSection.classList.remove('hidden');

    errorMessage.classList.add('hidden');

    const website = new URL(data.url);

    document.getElementById('resultWebsite').textContent =
        website.hostname;

    document.getElementById('httpStatus').textContent =
        data.status ?? '--';

    document.getElementById('statusText').textContent =
        data.statusText || 'Unavailable';

    document.getElementById('responseTime').textContent =
        data.responseTime !== null
            ? `${data.responseTime} ms`
            : '--';

    document.getElementById('protocol').textContent =
        data.protocol.toUpperCase();

    document.getElementById('checkedAt').textContent =
        new Date(data.checkedAt).toLocaleTimeString();

    if (data.online) {

        statusBadge.textContent = 'ONLINE';

        statusBadge.className = 'status-badge';

    } else {

        statusBadge.textContent = 'OFFLINE';

        statusBadge.className = 'status-badge offline';

        errorMessage.textContent =
            data.error || 'Website is not responding.';

        errorMessage.classList.remove('hidden');

    }

}