$(document).ready(function () {
    // --- Element Selectors ---
    const timerDisplay = $('#timer');
    const paymentForm = $('#payment-form');
    const cardPaymentSection = $('#card-payment-section');
    const upiPaymentSection = $('#upi-payment-section');
    const selectCardRadio = $('#selectCard');
    const selectUpiRadio = $('#selectUpi');
    const thankYouMessage = $('#thank-you-message');
    const timeoutMessage = $('#timeout-message');
    const cardMessage = $('#card-message');
    const upiMessage = $('#upi-message');
    const processingMessage = $('#processing-message');
    const submitButton = $('#submit-button');
    const qrCodeContainer = document.getElementById('qrcode-container');
    const qrMessageElement = $('#qr-message');
    const darkModeToggleButton = $('#dark-mode-toggle-payment');
    const goHomeButton = $('#go-home-button');

    const cardNumberInput = $('#cardNumber');
    const expiryDateInput = $('#expiryDate');
    const cvvInput = $('#cvv');
    const cardHolderInput = $('#cardHolder');
    const donationAmountInput = $('#donationAmount');

    // --- State Variables ---
    let timerInterval = null;
    let timeLeft = 600; // 10 minutes in seconds
    let qrCodeInstance = null;

    // --- Constants ---
    const MOTIVATIONAL_MESSAGES = [
        "\"The best way to find yourself is to lose yourself in the service of others.\" - Mahatma Gandhi",
        "\"Small acts, when multiplied by millions of people, can transform the world.\" - Howard Zinn",
        "\"Giving is not just about making a donation. It is about making a difference.\" - Kathy Calvin",
        "\"We make a living by what we get, but we make a life by what we give.\" - Winston Churchill",
        "\"Your contribution brings us closer to a vibrant celebration. Thank you!\"",
        "\"Every drop makes an ocean. Your support matters!\"",
        "\"Let the spirit of Durga Puja unite us through generosity.\""
    ];
    const UPI_ID = "suprapahigh.donation@okhdfcbank"; // Replace if needed
    const HIGH_DONATION_THRESHOLD = 5000;

    // --- Dark Mode ---
    function updateDarkModeButtonIcon() {
        if (!darkModeToggleButton) return; // Add safety check
        if (document.documentElement.classList.contains('dark-mode')) {
            darkModeToggleButton.html('<i class="fas fa-sun"></i>');
        } else {
            darkModeToggleButton.html('<i class="fas fa-moon"></i>');
        }
        // console.log("Dark mode icon updated."); // Debug log
    }

    if (darkModeToggleButton) {
        darkModeToggleButton.on('click', function () {
            // console.log("Dark mode toggle clicked."); // Debug log
            document.documentElement.classList.toggle('dark-mode');
            try {
                localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
                // console.log("Dark mode state saved:", localStorage.getItem('darkMode')); // Debug log
            } catch (e) {
                console.error("Could not save dark mode state to localStorage:", e);
            }
            updateDarkModeButtonIcon();
        });
    }

    // --- Timer ---
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        // console.log("Timer stopped."); // Debug log
    }

    function startTimer() {
        if (!timerDisplay) return; // Safety check
        stopTimer(); // Clear any existing timer first
        timeLeft = 600; // Reset time
        timerDisplay.text('10:00'); // Reset display
        // console.log("Starting timer..."); // Debug log
        timerInterval = setInterval(() => {
            if (!timerDisplay) { // Check if display exists within interval
                stopTimer();
                return;
            }
            if (timeLeft <= 0) {
                stopTimer();
                disableForm('timeout');
            } else {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);
    }

    // --- UI State & Messages ---
    function hideAllMessages() {
        if (cardMessage) cardMessage.hide().removeClass('alert-success alert-danger alert-warning alert-info');
        if (upiMessage) upiMessage.hide().removeClass('alert-success alert-danger alert-warning alert-info');
        if (thankYouMessage) thankYouMessage.hide();
        if (timeoutMessage) timeoutMessage.hide();
        if (processingMessage) processingMessage.hide();
        $('.form-text.text-danger').text('');
        $('.form-control').removeClass('is-invalid');
        if (submitButton) submitButton.removeClass('processing').find('.spinner-border').hide(); // Ensure spinner is hidden
        // Remove effects class on hiding messages
        $('body').removeClass('confetti-active');
    }

    function showMessage(element, type, text) {
        if (!element) return;
        element.removeClass('alert-success alert-danger alert-warning alert-info')
            .addClass(`alert-${type}`)
            .html(text)
            .show();
    }

    function disableForm(reason = 'timeout', messageText = '') {
        console.log(`disableForm called with reason: ${reason}`);
        hideAllMessages();
        const isProcessing = reason === 'processing';
        const isSuccess = reason === 'success';
        const isTimeout = reason === 'timeout';
        const isError = reason === 'error'; // General error state (API simulation)

        // console.log("Disabling form, reason:", reason); // Debug log

        // Always disable inputs if not processing, error, or timeout
        // Allow form interaction only if it's an error state that needs fixing
        const shouldDisableInputs = isProcessing || isSuccess || isTimeout;
        if (paymentForm) paymentForm.find('input, button:not(#go-home-button)').prop('disabled', shouldDisableInputs);
        if (submitButton) submitButton.toggleClass('disabled', shouldDisableInputs);

        if (cardPaymentSection) cardPaymentSection.toggleClass('disabled-section', shouldDisableInputs);
        if (upiPaymentSection) upiPaymentSection.toggleClass('disabled-section', true); // Keep UPI disabled unless actively selected

        if (isProcessing) {
            if (submitButton) submitButton.addClass('processing').find('.spinner-border').show();
            if (processingMessage) processingMessage.show();
        } else {
            if (submitButton) submitButton.removeClass('processing').find('.spinner-border').hide();
        }

        if (isTimeout) {
            if (timeoutMessage) timeoutMessage.text(messageText || 'Payment session timed out. Please refresh and try again.').show();
            stopTimer();
            if (goHomeButton) goHomeButton.show(); // Show home button on timeout
        } else if (isSuccess) {
            if (thankYouMessage) thankYouMessage.html(messageText || 'Thank you for your generous donation! 🙏 Your support makes a difference.').show();
            stopTimer();
            if (goHomeButton) goHomeButton.show(); // Show home button on success
        } else if (isError && messageText) {
            showMessage(cardMessage, 'danger', messageText);
            if (submitButton) submitButton.prop('disabled', false).removeClass('disabled'); // Re-enable submit on fixable error
            if (cardPaymentSection) cardPaymentSection.removeClass('disabled-section'); // Re-enable card section
            if (goHomeButton) goHomeButton.show(); // Show home button on error as well
        }

        // Ensure confetti is removed if not successful
        if (reason !== 'success') {
            $('body').removeClass('confetti-active');
        }
    }

    // --- Payment Method Switching ---
    function handlePaymentMethodChange() {
        hideAllMessages();
        const isCard = selectCardRadio.is(':checked');

        // console.log("Payment method change. Is card selected?", isCard); // Debug log

        // Toggle visibility first
        if (cardPaymentSection) cardPaymentSection.toggleClass('hidden', !isCard);
        if (upiPaymentSection) upiPaymentSection.toggleClass('hidden', isCard);

        // Then handle disabled states and logic
        if (cardPaymentSection) cardPaymentSection.removeClass('disabled-section'); // Always enable card section if visible
        if (upiPaymentSection) upiPaymentSection.addClass('disabled-section'); // Start UPI as disabled visually

        if (paymentForm) paymentForm.find('input, button').prop('disabled', !isCard);
        if (submitButton) submitButton.toggleClass('disabled', !isCard);

        if (isCard) {
            // Card is selected
            if (timeLeft > 0 && !timerInterval) {
                startTimer();
            }
        } else {
            // UPI is selected
            if (upiPaymentSection) upiPaymentSection.removeClass('disabled-section'); // Enable UPI section visually
            // Ensure the section is visible *before* generating QR code
            // (Using a small timeout might help if there are race conditions with CSS display property)
            setTimeout(() => {
                updateQrMessage();
            }, 0);
            if (timeLeft > 0 && !timerInterval) {
                startTimer();
            }
        }
    }

    if (selectCardRadio && selectUpiRadio) {
        $('input[name="paymentMethod"]').change(handlePaymentMethodChange);
    }

    // --- Input Filtering (on keydown - less intensive) ---
    function filterDigits(event) {
        if (!/^\d$|^Backspace$|^Delete$|^Tab$|^Escape$|^Enter$|^ArrowLeft$|^ArrowRight$|^Home$|^End$/.test(event.key)) {
            event.preventDefault();
        }
    }

    function filterExpiry(event) {
        const input = $(this);
        const value = input.val();
        const key = event.key;

        // Allow only digits, slash, and control keys
        if (!/^\d$|^\/$|^Backspace$|^Delete$|^Tab$|^Escape$|^Enter$|^ArrowLeft$|^ArrowRight$|^Home$|^End$/.test(key)) {
            event.preventDefault();
            return;
        }

        // Prevent multiple slashes
        if (key === '/' && value.includes('/')) {
            event.preventDefault();
            return;
        }

        // Simplify: Remove the complex month validation during filtering.
        // It was causing issues with backspace/editing.
        // We will rely on formatExpiryDate (on input) and validateExpiry (on blur/submit)
        // to handle month validity (01-12) and expiration.

        /* --- REMOVED ----
        // Prevent month from starting with > 1
        if (value.length === 0 && !/^[01]$/.test(key)) {
             event.preventDefault();
             return;
        }
        // Prevent month > 12 (e.g., 13, 14...)
        if (value.length === 1 && value === '1' && !/^[0-2]$/.test(key)) {
             event.preventDefault();
             return;
        }
        // Prevent typing slash if month is invalid (e.g., 00 /)
        if (key === '/' && value === '00') {
            event.preventDefault();
            return;
        }
        ---- REMOVED --- */
    }

    function filterAmount(event) {
        if (['e', 'E', '+', '-'].includes(event.key)) {
            event.preventDefault();
            return;
        }
        if (!/^\d$|^\.$|^Backspace$|^Delete$|^Tab$|^Escape$|^Enter$|^ArrowLeft$|^ArrowRight$|^Home$|^End$/.test(event.key)) {
            event.preventDefault();
        }
        if (event.key === '.' && $(this).val().includes('.')) {
            event.preventDefault();
        }
    }

    function filterName(event) {
        if (!/^[a-zA-Z\s'.\-]$|^Backspace$|^Delete$|^Tab$|^Escape$|^Enter$|^ArrowLeft$|^ArrowRight$|^Home$|^End$/.test(event.key)) {
            event.preventDefault();
        }
    }

    // --- Input Formatting (on input/blur - more intensive, use blur where possible) ---
    function formatCardNumber() {
        if (!cardNumberInput) return;
        let value = cardNumberInput.val().replace(/\D/g, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        cardNumberInput.val(formattedValue.substring(0, 19)); // Max length 19 (16 digits + 3 spaces)
    }

    function formatExpiryDate() {
        if (!expiryDateInput) return;
        let value = expiryDateInput.val().replace(/\D/g, '');
        let formattedValue = value;

        if (value.length > 2) {
            formattedValue = value.substring(0, 2) + ' / ' + value.substring(2, 4);
        }

        // Validate month (01-12) during formatting
        if (value.length >= 2) {
            const monthInt = parseInt(value.substring(0, 2), 10);
            if (monthInt < 1 || monthInt > 12) {
                // Handle invalid month - maybe clear it or just prevent further typing?
                // For now, just format what we have, validation handles error state.
                // Alternative: Could slice value = value.substring(0, 1);
            }
        }

        expiryDateInput.val(formattedValue.substring(0, 7)); // Max length MM / YY = 7
    }

    function formatAmount() {
        if (!donationAmountInput) return;
        let cursorPosition = donationAmountInput[0].selectionStart;
        let originalValue = donationAmountInput.val();
        let originalLength = originalValue.length;

        let value = originalValue.replace(/[^\d.]/g, '');
        let parts = value.split('.');
        let integerPart = parts[0].replace(/,/g, '');
        let decimalPart = parts.length > 1 ? '.' + parts[1].substring(0, 2) : '';

        let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        let newValue = formattedInteger + decimalPart;

        if (originalValue !== newValue) { // Avoid repositioning if no change
            donationAmountInput.val(newValue);
            let newLength = newValue.length;
            let diff = newLength - originalLength;
            cursorPosition += diff;

            // Adjust cursor if it's after a newly added comma or before a removed one (simplistic adjustment)
            let originalCommas = (originalValue.slice(0, cursorPosition - diff).match(/,/g) || []).length;
            let newCommas = (newValue.slice(0, cursorPosition).match(/,/g) || []).length;
            cursorPosition += (newCommas - originalCommas);

            if (cursorPosition < 0) cursorPosition = 0;
            if (cursorPosition > newLength) cursorPosition = newLength;
            donationAmountInput[0].setSelectionRange(cursorPosition, cursorPosition);
        }
    }

    // --- Attach Event Listeners ---
    if (cardNumberInput) cardNumberInput.on('keydown', filterDigits).on('input', formatCardNumber);
    if (expiryDateInput) expiryDateInput.on('keydown', filterExpiry).on('input', formatExpiryDate);
    if (cvvInput) cvvInput.on('keydown', filterDigits);
    if (donationAmountInput) donationAmountInput.on('keydown', filterAmount).on('input', formatAmount);
    if (cardHolderInput) cardHolderInput.on('keydown', filterName);

    // Add blur listeners for final validation feedback
    if (cardNumberInput) cardNumberInput.on('blur', function () { validateField($(this), isValidLuhn, '#card-error', 'Invalid card number.'); detectCardTypeAndIcon($(this).val()); });
    if (expiryDateInput) expiryDateInput.on('blur', function () { validateField($(this), validateExpiry, '#expiry-error', 'Use MM / YY format or card is expired.'); });
    if (cvvInput) cvvInput.on('blur', function () { validateField($(this), validateCVV, '#cvv-error', 'Enter a valid 3 or 4 digit CVV.'); });
    if (cardHolderInput) cardHolderInput.on('blur', function () { validateField($(this), validateName, '#name-error', 'Please enter a valid name.'); });
    if (donationAmountInput) donationAmountInput.on('blur', function () { validateField($(this), validateAmount, '#amount-error', 'Enter a valid amount (minimum ₹1).'); });

    // --- QR Code Generation ---
    function updateQrMessage() {
        if (!qrCodeContainer) {
            console.error("QR Code container not found.");
            showMessage(upiMessage, 'danger', 'QR Code display error. Try again or use UPI ID.');
            return;
        }

        // Check if QRCode library is loaded
        if (typeof QRCode === 'undefined') {
            console.error("QRCode library (qrcode.min.js) is not loaded.");
            showMessage(upiMessage, 'danger', 'QR Code library failed to load. Please use the UPI ID.');
            qrCodeContainer.innerHTML = '<p class="text-danger small">QR Library Error</p>';
            if (qrMessageElement) qrMessageElement.text('');
            return;
        }

        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
        const messageText = MOTIVATIONAL_MESSAGES[randomIndex];
        const qrData = `upi://pay?pa=${UPI_ID}&pn=Suprapa High Donation&tn=${encodeURIComponent(messageText)}`;

        if (qrMessageElement) qrMessageElement.text(messageText);

        qrCodeContainer.innerHTML = '';
        try {
            if (typeof QRCode !== 'undefined') {
                // console.log("Generating QR code..."); // Debug log
                qrCodeInstance = new QRCode(qrCodeContainer, {
                    text: qrData,
                    width: 150,
                    height: 150,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
                // console.log("QR code generated."); // Debug log
                console.log("QRCode instance created:", qrCodeInstance);
            } else {
                throw new Error('QRCode library not loaded');
            }
        } catch (error) {
            console.error("QR Code generation failed:", error);
            showMessage(upiMessage, 'danger', 'Could not generate QR code. Please use the UPI ID.');
            if (qrMessageElement) qrMessageElement.text('');
        }
    }

    // --- Card Validation (Luhn Algorithm & Type Detection) ---
    function isValidLuhn(number) {
        number = number.replace(/\D/g, '');
        if (!number || number.length < 13 || number.length > 19) return false;
        let sum = 0;
        let shouldDouble = false;
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number.charAt(i));
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }

    function detectCardType(number) {
        number = number.replace(/\D/g, '');
        if (/^4/.test(number)) return 'Visa';
        if (/^5[1-5]/.test(number)) return 'Mastercard';
        if (/^3[47]/.test(number)) return 'Amex';
        if (/^6(?:011|5)/.test(number)) return 'Discover';
        if (/^3(?:0[0-5]|[68])/.test(number)) return 'Diners';
        if (/^(?:2131|1800|35)/.test(number)) return 'JCB';
        return '';
    }

    function detectCardTypeAndIcon(number) {
        if (!number) return;
        const type = detectCardType(number);
        const iconElement = $('#card-type-icon');
        if (iconElement) iconElement.text(type || '');
    }

    // --- Individual Field Validation (for blur events) ---
    function validateField(inputElement, validationFn, errorElementSelector, errorMessage) {
        if (!inputElement || !inputElement.length) return true; // Skip if element doesn't exist
        const value = inputElement.val();
        const result = validationFn(value);
        const errorElement = $(errorElementSelector);
        if (!errorElement || !errorElement.length) return true; // Skip if error element doesn't exist

        if (result === true) { // Simple valid case
            inputElement.removeClass('is-invalid');
            errorElement.text('');
            return true;
        } else if (result === 'expired') { // Expired card case
            inputElement.addClass('is-invalid');
            errorElement.text('Card has expired.');
            return false;
        } else if (result === 'too_future') { // Too far future case
            inputElement.addClass('is-invalid');
            errorElement.text('Expiry year too far in the future.');
            return false;
        } else { // Other invalid cases (false)
            if (value.trim() !== '') {
                inputElement.addClass('is-invalid');
                errorElement.text(errorMessage);
            } else {
                // Don't show error for empty optional fields, but mark required fields invalid
                if (inputElement.prop('required')) {
                    inputElement.addClass('is-invalid');
                    errorElement.text('This field is required.'); // Generic required message
                } else {
                    inputElement.removeClass('is-invalid');
                    errorElement.text('');
                }
            }
            return false;
        }
    }

    // --- Combined Validator Functions (used by validateField and validateForm) ---
    function validateExpiry(expiry) {
        if (!expiry) return false; // Required field check
        const trimmedExpiry = expiry.trim();
        // Regex ensures MM is 01-12 and YY is 2 digits
        if (!/^(0[1-9]|1[0-2])\s?\/\s?(\d{2})$/.test(trimmedExpiry)) return false;
        const [month, yearSuffix] = trimmedExpiry.replace(/\s/g, '').split('/');
        const monthInt = parseInt(month, 10);

        if (monthInt < 1 || monthInt > 12) {
            console.warn("Invalid month passed regex check?", monthInt); // Should not happen
            return false;
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const expiryYear = 2000 + parseInt(yearSuffix, 10);

        // Check if expired
        if (expiryYear < currentYear || (expiryYear === currentYear && monthInt < currentMonth)) {
            return 'expired';
        }

        // Check if too far in the future (e.g., > 12 years from now)
        const maxAllowedYear = currentYear + 12;
        if (expiryYear > maxAllowedYear) {
            console.log(`Expiry year ${expiryYear} is beyond max allowed ${maxAllowedYear}`);
            return 'too_future'; // Special return value for future validity
        }

        return true; // Valid format and not expired or too far future
    }

    function validateCVV(cvv) {
        if (!cvv) return false; // Required field check
        return /^\d{3,4}$/.test(cvv.trim());
    }

    function validateName(name) {
        if (!name) return false; // Required field check
        return /^[a-zA-Z\s'.\-]+$/.test(name.trim()) && name.trim().length > 1;
    }

    function validateAmount(amount) {
        if (!amount) return false; // Required field check
        const numericAmount = amount.replace(/,/g, '').trim();
        // Allow amounts like '1' or '1.00' etc.
        if (!/^\d+(\.\d*)?$/.test(numericAmount)) return false;
        return parseFloat(numericAmount) >= 1;
    }

    // --- Form Validation (onSubmit) ---
    function validateForm() {
        // console.log("Validating form on submit..."); // Debug log
        hideAllMessages();
        let isFormValid = true;

        // Define specific error messages
        const expiryErrorMessage = () => {
            const result = validateExpiry(expiryDateInput.val());
            if (result === 'expired') return 'Card has expired.';
            if (result === 'too_future') return 'Expiry year too far in the future.';
            return 'Use MM / YY format.';
        };

        // Validate required fields using the blur validation logic
        if (!validateField(cardNumberInput, isValidLuhn, '#card-error', 'Please enter a valid card number.')) isFormValid = false;
        if (!validateField(expiryDateInput, validateExpiry, '#expiry-error', expiryErrorMessage())) isFormValid = false; // Use dynamic error message
        if (!validateField(cvvInput, validateCVV, '#cvv-error', 'Enter a valid 3 or 4 digit CVV.')) isFormValid = false;
        if (!validateField(cardHolderInput, validateName, '#name-error', 'Please enter a valid name.')) isFormValid = false;
        if (!validateField(donationAmountInput, validateAmount, '#amount-error', 'Enter a valid amount (minimum ₹1).')) isFormValid = false;

        if (!isFormValid) {
            // console.log("Form validation failed."); // Debug log
            showMessage(cardMessage, 'warning', 'Please correct the errors highlighted below.');
        } else {
            // console.log("Form validation passed."); // Debug log
        }

        return isFormValid;
    }

    // --- Dynamic Success Handling ---
    function triggerSpecialEffects() {
        console.log("Triggering special effects (adding confetti class)!");
        $('body').addClass('confetti-active');
        // REMOVED: Timeout to remove class is now handled in the main delay
        // setTimeout(() => {
        //      console.log("Confetti effect timeout finished (removing confetti class).");
        //      $('body').removeClass('confetti-active');
        // }, 5000);
    }

    // --- Initial Setup ---
    function initializePaymentPage() {
        // console.log("Initializing payment page script..."); // Debug log
        if (!selectCardRadio || !selectUpiRadio) {
            console.warn("Payment method radio buttons not found. Cannot initialize method switching.");
            return; // Stop initialization if core elements missing
        }
        try {
            handlePaymentMethodChange(); // Set initial view based on default checked
            updateDarkModeButtonIcon(); // Set initial dark mode icon
            // Timer is started by handlePaymentMethodChange if applicable
            console.log("Initialization complete."); // Debug log
        } catch (e) {
            console.error("Error during initialization:", e);
            showMessage(cardMessage || $('body'), 'danger', 'An error occurred while loading the page. Please refresh.');
        }
    }

    initializePaymentPage(); // Run on document ready

    // --- Event Listeners Initialization ---
    if (paymentForm) {
        paymentForm.on('submit', function (e) {
            e.preventDefault();
            if (validateForm()) {

                // ---> Read amount BEFORE disabling form
                const donationAmountValue = $("#donationAmount").val() || '0';
                const amount = parseFloat(donationAmountValue.replace(/,/g, '')); // Ensure no commas
                console.log(`[Submit Start] Amount read from form: ${amount}`);

                // Simulate processing (disable form AFTER reading amount)
                disableForm('processing');

                // Simulate API call delay
                console.log("Starting API simulation timeout (2.5s)...");
                setTimeout(() => {
                    console.log("API simulation finished.");
                    // Simulate success/failure
                    const isSuccess = Math.random() > 0.1; // 90% success rate

                    // ---> Use the 'amount' variable captured BEFORE the timeout
                    console.log(`Simulation result: ${isSuccess ? 'Success' : 'Failure'}, Using pre-read Amount: ${amount}`);

                    if (isSuccess) {
                        // --- Generate Base Bill --- 
                        const cardHolderName = $('#cardHolder').val() || 'Anonymous Donor';
                        const transactionTime = new Date();
                        const formattedTime = transactionTime.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

                        // ---> Start with the standard receipt structure
                        let billHtml = `
                            <div class="receipt-container">
                                <h4 class="receipt-header">Donation Receipt</h4>
                                <hr>
                                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                                <p><strong>Date & Time:</strong> ${formattedTime}</p>
                                <p><strong>Donated To:</strong> Suprapa High Donation Portal</p>
                                <p><strong>Donated By:</strong> ${cardHolderName}</p>
                                <p class="receipt-amount"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <hr>
                                <p class="receipt-footer">Thank you for your generous support!</p>
                            </div>
                         `;

                        // ---> Add extra acknowledgement for large donations
                        let specialAcknowledgement = '';
                        if (amount >= HIGH_DONATION_THRESHOLD + 5000) {
                            specialAcknowledgement = `<p class="text-center font-weight-bold text-info">Wow! Your extraordinary generosity leaves us speechless! 🙏🙏🙏 🏆✨</p>`;
                        } else if (amount >= HIGH_DONATION_THRESHOLD) {
                            specialAcknowledgement = `<p class="text-center font-weight-bold text-info">Your substantial contribution is truly appreciated! ✨🏆</p>`;
                        }

                        // Prepend the acknowledgement if it exists
                        if (specialAcknowledgement) {
                            const containerEndIndex = billHtml.indexOf('<hr>') + 4; // Find first HR and insert after
                            billHtml = billHtml.slice(0, containerEndIndex) + specialAcknowledgement + billHtml.slice(containerEndIndex);
                        }

                        console.log(`Generated Bill HTML (with potential acknowledgement):\n${billHtml}`);

                        // Pass the final bill HTML directly to disableForm
                        disableForm('success', billHtml);

                        // ---> Trigger confetti for ALL successful donations
                        triggerSpecialEffects(); // Moved outside the condition

                        // ---> Add extra effect ONLY for high donations
                        if (amount >= HIGH_DONATION_THRESHOLD) {
                            console.log(`High donation detected (₹${amount}), adding temporary glow effect.`);
                            // Add glow class
                            $('body').addClass('high-donation-glow');
                            // Remove glow class after a few seconds (matching CSS animation: 2s * 3 = 6s)
                            setTimeout(() => {
                                console.log("Removing high donation glow effect.");
                                $('body').removeClass('high-donation-glow');
                            }, 6500); // Adjusted timeout to 6.5 seconds
                        }

                        // Delay form reset and cleanup for 25 seconds
                        console.log("Starting delayed form reset timeout (25s)...");
                        setTimeout(() => {
                            console.log("Performing delayed form reset and cleanup...");
                            // Clear form fields on success
                            if (paymentForm && paymentForm[0]) paymentForm[0].reset();
                            // Reset card icon
                            detectCardTypeAndIcon('');
                            // If UPI was selected, maybe clear QR?
                            if (selectUpiRadio && selectUpiRadio.is(':checked')) {
                                if (qrCodeContainer) qrCodeContainer.innerHTML = '';
                                if (qrMessageElement) qrMessageElement.text('QR code will appear here.');
                            }
                            // Reset timer display, though it's stopped
                            if (timerDisplay) timerDisplay.text("--:--");

                            // ---> Remove confetti class after the delay
                            console.log("Removing confetti class after delay."); // <<< ADD LOG
                            $('body').removeClass('confetti-active');

                            // Optionally hide success message and button after delay, or leave them visible
                            // thankYouMessage.hide();
                            // goHomeButton.hide();
                        }, 25000); // 25000 milliseconds = 25 seconds

                    } else {
                        disableForm('error', 'Payment failed. Please check your details and try again.');
                    }
                }, 2500); // Simulate 2.5 second processing time
            }
        });
    }

    // Attach input filtering and formatting
    if (cardNumberInput) {
        cardNumberInput.on('keydown', filterDigits);
        cardNumberInput.on('input', formatCardNumber);
        cardNumberInput.on('input', function () { // Use input for immediate feedback
            detectCardTypeAndIcon($(this).val());
        });
    }
    if (expiryDateInput) {
        expiryDateInput.on('keydown', filterExpiry);
        expiryDateInput.on('input', formatExpiryDate); // Format as user types
    }
    $('#cvv').on('keydown', filterDigits);
    $('#cardHolderName').on('keydown', filterName);
    $('#donationAmount').on('keydown', filterAmount);

    // Dark Mode Toggle
    if (darkModeToggleButton) {
        darkModeToggleButton.on('click', function () {
            const isDarkMode = !$('body').hasClass('dark-mode');
            $('body').toggleClass('dark-mode', isDarkMode);
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            updateDarkModeButtonIcon(); // Update icon based on new state
        });
    }

    // Go to Home Button Click Handler
    if (goHomeButton) {
        goHomeButton.on('click', function () {
            window.location.href = 'Homepage2.html'; // Redirect to homepage
        });
    }

    // Initial setup
    initializePaymentPage();
}); 