/* Premium UI Logic */

// Modal System
const ModalSystem = {
    init() {
        // Create modal DOM if it doesn't exist
        if (!document.getElementById('custom-modal-overlay')) {
            const modalHTML = `
                <div id="custom-modal-overlay" class="custom-modal-overlay">
                    <div class="custom-modal">
                        <span class="modal-close" onclick="ModalSystem.close()">×</span>
                        <div id="modal-icon" class="modal-icon">🎉</div>
                        <div id="modal-title" class="modal-title">Title</div>
                        <div id="modal-message" class="modal-message">Message goes here</div>
                        <button id="modal-btn" class="modal-btn" onclick="ModalSystem.close()">Awesome!</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Close on overlay click
        const overlay = document.getElementById('custom-modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                ModalSystem.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ModalSystem.close();
            }
        });
    },

    show(message, title = 'Game Update', icon = '🎮', buttonText = 'OK', onConfirm = null) {
        const overlay = document.getElementById('custom-modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const iconEl = document.getElementById('modal-icon');
        const btnEl = document.getElementById('modal-btn');

        titleEl.textContent = title;
        messageEl.innerHTML = message; // Allow HTML in message
        iconEl.textContent = icon;
        btnEl.textContent = buttonText;

        // Reset click handler
        btnEl.onclick = () => {
            ModalSystem.close();
            if (onConfirm) onConfirm();
        };

        overlay.classList.add('active');
    },

    close() {
        const overlay = document.getElementById('custom-modal-overlay');
        overlay.classList.remove('active');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ModalSystem.init();
});

// Override window.alert for a quick aesthetic boost (optional, but safer to use ModalSystem.show explicitly)
// window.alert = function(msg) {
//     ModalSystem.show(msg);
// };

// Export for usage in other files
window.showModal = ModalSystem.show;
window.closeModal = ModalSystem.close;
