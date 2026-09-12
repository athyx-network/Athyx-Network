async function loadWispServers() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/athyx-network/Athyx-Network@main/wisp.txt');
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();
        const urls = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.startsWith('ws'));
        
        const container = document.getElementById('dynamic-wisps-container');
        if (container) {
            container.innerHTML = '';
            urls.forEach(url => {
                const wispOption = document.createElement('div');
                wispOption.className = 'wisp-option';
                wispOption.dataset.url = url;
                
                const urlObj = new URL(url);
                const name = urlObj.hostname;
                
                wispOption.innerHTML = `
                    <div class="wisp-option-header">
                        <span class="wisp-option-name">${name}</span>
                        <button class="wisp-option-btn" data-action="select-wisp">Select</button>
                    </div>
                    <div class="wisp-option-url">${url}</div>
                    <div class="wisp-option-description">Loaded from wisp.txt</div>
                `;
                container.appendChild(wispOption);
            });
            
            // Re-bind click events for new options
            container.querySelectorAll('[data-action="select-wisp"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const option = e.target.closest('.wisp-option');
                    if (option) {
                        selectWispUrl(option.dataset.url);
                    }
                });
            });
            
            // Re-apply selected state
            const currentUrl = localStorage.getItem('proxServer') || (typeof _CONFIG !== 'undefined' ? _CONFIG.wispurl : "wss://wisp.rhw.one/wisp/");
            const selectedOption = container.querySelector(`[data-url="${currentUrl}"]`);
            if (selectedOption) {
                selectedOption.querySelector('.wisp-option-btn').textContent = 'Selected';
            }
        }
    } catch (e) {
        console.error('Error loading wisp.txt:', e);
        const container = document.getElementById('dynamic-wisps-container');
        if (container) {
            container.innerHTML = '<div class="wisp-status status-error">Failed to load WISP servers.</div>';
        }
    }
}
