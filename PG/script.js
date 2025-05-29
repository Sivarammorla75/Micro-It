// Get references to DOM elements
        const passwordDisplay = document.getElementById('passwordDisplay');
        const copyPasswordButton = document.getElementById('copyPasswordButton');
        const passwordLengthInput = document.getElementById('passwordLength');
        const lengthValueSpan = document.getElementById('lengthValue');
        const includeUppercaseCheckbox = document.getElementById('includeUppercase');
        const includeLowercaseCheckbox = document.getElementById('includeLowercase');
        const includeNumbersCheckbox = document.getElementById('includeNumbers');
        const includeSymbolsCheckbox = document.getElementById('includeSymbols');
        const excludeSimilarCheckbox = document.getElementById('excludeSimilar'); // New reference
        const generateButton = document.getElementById('generateButton');
        const messageDisplay = document.getElementById('messageDisplay');
        const errorDisplay = document.getElementById('errorDisplay');
        const strengthIndicator = document.getElementById('strengthIndicator');
        const passwordHistoryList = document.getElementById('passwordHistoryList');
        const clearHistoryButton = document.getElementById('clearHistoryButton');

        // Define character sets
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_-+=[]{}|;:,.<>?';

        // Array to store password history (persisted in localStorage)
        let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

        // Function to display messages (success)
        const showMessage = (message) => {
            messageDisplay.textContent = message;
            messageDisplay.classList.remove('hidden');
            setTimeout(() => {
                messageDisplay.classList.add('hidden');
                messageDisplay.textContent = '';
            }, 2000); // Hide message after 2 seconds
        };

        // Function to display error messages
        const showError = (message) => {
            errorDisplay.textContent = message;
            errorDisplay.classList.remove('hidden');
            setTimeout(() => {
                errorDisplay.classList.add('hidden');
                errorDisplay.textContent = '';
            }, 3000); // Hide error after 3 seconds
        };

        // Function to check password strength
        const checkPasswordStrength = (password) => {
            let score = 0;
            if (password.length >= 8) score += 1;
            if (password.length >= 12) score += 1;
            if (/[A-Z]/.test(password)) score += 1;
            if (/[a-z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[!@#$%^&*()_\-+=[]{}\|;:,.<>?]/.test(password)) score += 1;

            let strengthText = 'Very Weak';
            let strengthColor = 'text-red-500';

            if (score >= 6) {
                strengthText = 'Very Strong';
                strengthColor = 'text-green-600';
            } else if (score >= 4) {
                strengthText = 'Strong';
                strengthColor = 'text-green-500';
            } else if (score >= 2) {
                strengthText = 'Medium';
                strengthColor = 'text-yellow-500';
            } else if (score >= 1) {
                strengthText = 'Weak';
                strengthColor = 'text-orange-500';
            }

            strengthIndicator.textContent = strengthText;
            strengthIndicator.className = `font-bold ${strengthColor}`; // Update class for color
        };

        // Function to generate the password
        const generatePassword = () => {
            const length = parseInt(passwordLengthInput.value);
            const includeUppercase = includeUppercaseCheckbox.checked;
            const includeLowercase = includeLowercaseCheckbox.checked;
            const includeNumbers = includeNumbersCheckbox.checked;
            const includeSymbols = includeSymbolsCheckbox.checked;
            const excludeSimilar = excludeSimilarCheckbox.checked; // Get state of new checkbox

            let currentUppercaseChars = uppercaseChars;
            let currentLowercaseChars = lowercaseChars;
            let currentNumberChars = numberChars;
            let currentSymbolChars = symbolChars;

            // Define characters that are often confused (e.g., l, I, 1, o, O, 0)
            const similarCharsToExclude = 'lI1oO0';

            // Filter out similar characters if the option is checked
            if (excludeSimilar) {
                currentUppercaseChars = currentUppercaseChars.split('').filter(char => !similarCharsToExclude.includes(char)).join('');
                currentLowercaseChars = currentLowercaseChars.split('').filter(char => !similarCharsToExclude.includes(char)).join('');
                currentNumberChars = currentNumberChars.split('').filter(char => !similarCharsToExclude.includes(char)).join('');
                currentSymbolChars = currentSymbolChars.split('').filter(char => !similarCharsToExclude.includes(char)).join('');
            }

            let selectedCharPools = []; // Array to hold the character sets that are selected and filtered
            let allAvailableChars = ''; // Combined pool of all available characters after filtering

            // Add character sets to selectedCharPools and allAvailableChars if selected and not empty
            if (includeUppercase && currentUppercaseChars.length > 0) {
                selectedCharPools.push(currentUppercaseChars);
                allAvailableChars += currentUppercaseChars;
            }
            if (includeLowercase && currentLowercaseChars.length > 0) {
                selectedCharPools.push(currentLowercaseChars);
                allAvailableChars += currentLowercaseChars;
            }
            if (includeNumbers && currentNumberChars.length > 0) {
                selectedCharPools.push(currentNumberChars);
                allAvailableChars += currentNumberChars;
            }
            if (includeSymbols && currentSymbolChars.length > 0) {
                selectedCharPools.push(currentSymbolChars);
                allAvailableChars += currentSymbolChars;
            }

            // Handle case where no character type is selected or all filtered out
            if (selectedCharPools.length === 0 || allAvailableChars.length === 0) {
                showError('Please select at least one character type, or adjust "Exclude Similar" if it filters out all characters.');
                passwordDisplay.value = '';
                strengthIndicator.textContent = 'N/A';
                strengthIndicator.className = 'font-bold text-gray-500';
                return;
            }

            // Ensure password length is sufficient for guaranteed characters
            if (length < selectedCharPools.length) {
                showError(`Password length must be at least ${selectedCharPools.length} for selected criteria.`);
                passwordDisplay.value = '';
                strengthIndicator.textContent = 'N/A';
                strengthIndicator.className = 'font-bold text-gray-500';
                return;
            }

            let generatedPasswordArray = [];

            // Guarantee at least one character from each selected type
            selectedCharPools.forEach(charSet => {
                const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
                generatedPasswordArray.push(randomChar);
            });

            // Fill the remaining length with random characters from the combined pool
            for (let i = generatedPasswordArray.length; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * allAvailableChars.length);
                generatedPasswordArray.push(allAvailableChars[randomIndex]);
            }

            // Shuffle the array to randomize the position of the guaranteed characters
            for (let i = generatedPasswordArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [generatedPasswordArray[i], generatedPasswordArray[j]] = [generatedPasswordArray[j], generatedPasswordArray[i]];
            }

            const generatedPassword = generatedPasswordArray.join('');
            passwordDisplay.value = generatedPassword;
            hideError();
            checkPasswordStrength(generatedPassword);
            savePasswordToHistory(generatedPassword);
        };

        // Function to copy the generated password to clipboard
        const copyPasswordToClipboard = () => {
            const password = passwordDisplay.value;
            if (password) {
                const tempInput = document.createElement('textarea');
                tempInput.value = password;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy'); // Use document.execCommand for clipboard operations
                document.body.removeChild(tempInput);
                showMessage('Password copied to clipboard!');

                // Change copy button icon to a checkmark temporarily
                copyPasswordButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                `;
                setTimeout(() => {
                    copyPasswordButton.innerHTML = `
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 3H9m10 0a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2z"></path></svg>
                    `;
                }, 1500); // Revert after 1.5 seconds
            } else {
                showError('No password to copy!');
            }
        };

        // Function to hide error messages (used internally)
        const hideError = () => {
            errorDisplay.classList.add('hidden');
            errorDisplay.textContent = '';
        };

        // Function to save password to history
        const savePasswordToHistory = (password) => {
            // Add to the beginning of the array
            passwordHistory.unshift(password);
            // Limit history to 5 items
            if (passwordHistory.length > 5) {
                passwordHistory.pop();
            }
            localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
            renderPasswordHistory();
        };

        // Function to render password history
        const renderPasswordHistory = () => {
            passwordHistoryList.innerHTML = ''; // Clear existing list
            if (passwordHistory.length === 0) {
                passwordHistoryList.innerHTML = '<li class="text-gray-500">No passwords generated yet.</li>';
                return;
            }
            passwordHistory.forEach((pw, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0';
                listItem.innerHTML = `
                    <span class="font-mono text-gray-700 text-sm break-all">${pw}</span>
                    <button class="ml-4 p-1 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-all duration-200 ease-in-out copy-history-btn" data-password="${pw}" title="Copy this password">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 3H9m10 0a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2z"></path></svg>
                    </button>
                `;
                passwordHistoryList.appendChild(listItem);
            });

            // Add event listeners to newly created copy buttons in history
            document.querySelectorAll('.copy-history-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const passwordToCopy = event.currentTarget.dataset.password;
                    const tempInput = document.createElement('textarea');
                    tempInput.value = passwordToCopy;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    showMessage('Password copied from history!');
                });
            });
        };

        // Function to clear password history
        const clearPasswordHistory = () => {
            passwordHistory = [];
            localStorage.removeItem('passwordHistory');
            renderPasswordHistory();
            showMessage('Password history cleared!');
        };

        // Event Listeners
        generateButton.addEventListener('click', generatePassword);
        copyPasswordButton.addEventListener('click', copyPasswordToClipboard);
        clearHistoryButton.addEventListener('click', clearPasswordHistory);

        // Update length value display when slider moves
        passwordLengthInput.addEventListener('input', () => {
            lengthValueSpan.textContent = passwordLengthInput.value;
            generatePassword(); // Regenerate password immediately when length changes
        });

        // Regenerate password when any checkbox changes
        includeUppercaseCheckbox.addEventListener('change', generatePassword);
        includeLowercaseCheckbox.addEventListener('change', generatePassword);
        includeNumbersCheckbox.addEventListener('change', generatePassword);
        includeSymbolsCheckbox.addEventListener('change', generatePassword);
        excludeSimilarCheckbox.addEventListener('change', generatePassword); // New event listener

        // Initial setup on page load
        window.onload = () => {
            generatePassword(); // Generate initial password
            renderPasswordHistory(); // Render history from localStorage
        };