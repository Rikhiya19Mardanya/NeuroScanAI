// Add a console log to confirm the script is loading
console.log("script.js loaded and running!");

// Global variable to simulate login status
// This will be set to true upon successful "login" via the login form.
let isLoggedIn = false;

// Ensure all DOM elements are loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Functionality ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        // Toggle the visibility of the mobile menu when the button is clicked
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    } else {
        console.warn("Mobile menu button not found!");
    }

    if (mobileMenu) {
        // Close the mobile menu when any navigation link inside it is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    } else {
        console.warn("Mobile menu not found!");
    }

    // --- General Modal Helper Functions ---

// Function to open any modal element
function openModal(modalElement) {
    if (modalElement) {
        modalElement.classList.remove('hidden');
        // Add a class to body to prevent scrolling when modal is open
        document.body.classList.add('overflow-hidden');
        console.log(`${modalElement.id} opened.`);
    } else {
        console.error("Modal element not found!");
    }
}

// Function to close any modal element
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden');
        // Remove the class from body to re-enable scrolling
        document.body.classList.remove('overflow-hidden');
        console.log(`${modalElement.id} closed.`);
    }
}


    // --- Login Modal Functionality ---
    const loginModal = document.getElementById('login-modal');
    const loginDesktopLink = document.getElementById('login-desktop-link');
    const loginMobileLink = document.getElementById('login-mobile-link');
    const closeModalButton = document.getElementById('close-modal-button');
    const loginForm = document.getElementById('login-form');

    // Event listeners for opening the Login modal
    if (loginDesktopLink) {
        loginDesktopLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor link behavior
            openModal(loginModal);
        });
        console.log("Desktop login link listener attached.");
    } else {
        console.warn("Desktop login link not found!");
    }

    if (loginMobileLink) {
        loginMobileLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor link behavior
            openModal(loginModal);
            if (mobileMenu) mobileMenu.classList.add('hidden'); // Close mobile menu if open
        });
        console.log("Mobile login link listener attached.");
    } else {
        console.warn("Mobile login link not found!");
    }

    // Event listener for closing the Login modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => closeModal(loginModal));
        console.log("Close login modal button listener attached.");
    } else {
        console.warn("Close login modal button not found!");
    }

    // Close Login modal if user clicks outside the modal content
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeModal(loginModal);
            }
        });
        console.log("Login modal overlay click listener attached.");
    }

    // Handle Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            const formData = {
                name: document.getElementById('login-name').value,
                email: document.getElementById('login-email').value,
                phone: document.getElementById('login-phone').value,
                age: document.getElementById('login-age').value,
                gender: document.getElementById('login-gender').value
            };

            console.log('Login Form Data:', formData);
            // Simulate successful login
            isLoggedIn = true;
            console.log('User is now logged in:', isLoggedIn);

            closeModal(loginModal); // Close the login modal
            loginForm.reset(); // Optionally clear the form fields

            // If the user was trying to detect tumor before logging in,
            // you might want to re-open the detection modal now.
            // This requires storing a state, e.g., in sessionStorage.
            // if (sessionStorage.getItem('redirect_to_detection') === 'true') {
            //     sessionStorage.removeItem('redirect_to_detection');
            //     openTumorDetectionModal();
            // }
        });
        console.log("Login form submit listener attached.");
    } else {
        console.warn("Login form not found!");
    }

    // --- Tumor Detection Modal Functionality ---
    const detectTumorButton = document.getElementById('detect-tumor-button');
    const tumorDetectionModal = document.getElementById('tumor-detection-modal');
    const closeTumorModalButton = document.getElementById('close-tumor-modal-button');
    const detectionContent = document.getElementById('detection-content');
    
    // These elements are dynamically created, so we need to get references when they exist
    let brainScanInput = null;
    let imagePreviewContainer = null;
    let imagePreview = null;
    let startDetectionButton = null;

    let uploadedImageFile = null; // To store the file object for upload

    // Function to handle image file selection for preview
    function handleBrainScanInputChange(event) {
        const file = event.target.files[0];
        if (file) {
            uploadedImageFile = file; // Store the file
            const reader = new FileReader();
            reader.onload = function(e) {
                // Ensure imagePreview and imagePreviewContainer are current references
                imagePreview = document.getElementById('image-preview');
                imagePreviewContainer = document.getElementById('image-preview-container');
                if (imagePreview) imagePreview.src = e.target.result;
                if (imagePreviewContainer) imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImageFile = null;
            // Ensure imagePreview and imagePreviewContainer are current references
            imagePreview = document.getElementById('image-preview');
            imagePreviewContainer = document.getElementById('image-preview-container');
            if (imagePreview) imagePreview.src = '#';
            if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
        }
    }

    // Function to set up event listeners for elements inside detectionContent
    // This is crucial because innerHTML updates remove previous elements and their listeners
    function setupDetectionContentListeners() {
        brainScanInput = document.getElementById('brain-scan-input');
        startDetectionButton = document.getElementById('start-detection-button');
        imagePreview = document.getElementById('image-preview'); // Re-get reference
        imagePreviewContainer = document.getElementById('image-preview-container'); // Re-get reference

        if (brainScanInput) {
            brainScanInput.removeEventListener('change', handleBrainScanInputChange); // Prevent duplicate listeners
            brainScanInput.addEventListener('change', handleBrainScanInputChange);
        }
        if (startDetectionButton) {
            startDetectionButton.removeEventListener('click', performTumorDetection); // Prevent duplicate listeners
            startDetectionButton.addEventListener('click', performTumorDetection);
        }
    }

    // Function to handle the actual tumor detection process
    async function performTumorDetection() {
        if (!uploadedImageFile) {
            detectionContent.innerHTML = `
                <p class="text-red-500 mb-4">Please upload a brain scan image first!</p>
                <button id="close-detection-results" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full mt-4 ml-2">Close</button>
            `;
            document.getElementById('close-detection-results').addEventListener('click', () => closeModal(tumorDetectionModal));
            return;
        }

        detectionContent.innerHTML = `
            <p class="text-gray-700 mb-4">Uploading and detecting... Please wait...</p>
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mt-6"></div>
        `;

        const formData = new FormData();
        formData.append('image', uploadedImageFile);

        try {
            // IMPORTANT: Replace with your actual backend API endpoint
            const backendUrl = 'https://neuroscanai2.onrender.com/predict_tumor';
            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
    const errorText = await response.text(); // Get more detailed error from backend
    throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
}

const result = await response.json();
console.log('Detection Result:', result);

let resultMessage = '';
let resultColor = '';

if (result.prediction === "Tumor Detected") {
    resultMessage = `Tumor Detected! Probability: ${(result.probability * 100).toFixed(2)}%`;
    resultColor = 'text-red-600';
} else {
    resultMessage = `No Tumor Detected. Probability: ${(result.probability * 100).toFixed(2)}%`;
    resultColor = 'text-green-600';
}


            detectionContent.innerHTML = `
                <p class="text-gray-700 mb-4">Detection complete!</p>
                <p class="font-bold text-xl ${resultColor}">${resultMessage}</p>
                <button id="reset-detection-button" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full mt-4">Perform Another Detection</button>
                <button id="close-detection-results" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full mt-4 ml-2">Close</button>
            `;

            // Add event listeners for new buttons
            document.getElementById('reset-detection-button').addEventListener('click', resetDetectionModal);
            document.getElementById('close-detection-results').addEventListener('click', () => closeModal(tumorDetectionModal));

        } catch (error) {
            console.error('Error during detection:', error);
            detectionContent.innerHTML = `
                <p class="text-red-500 mb-4">Error during detection: ${error.message}</p>
                <button id="retry-detection-button" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-full mt-4">Try Again</button>
                <button id="close-detection-results" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full mt-4 ml-2">Close</button>
            `;
            document.getElementById('retry-detection-button').addEventListener('click', () => {
                resetDetectionModal(); // Reset to initial state
                openTumorDetectionModal(); // Re-open the modal to allow retry
            });
            document.getElementById('close-detection-results').addEventListener('click', () => closeModal(tumorDetectionModal));
        }
    }

    // Function to reset the detection modal to its initial state
    function resetDetectionModal() {
        detectionContent.innerHTML = `
            <p class="text-gray-700 mb-4">Upload a brain scan image for detection.</p>
            <input type="file" id="brain-scan-input" accept="image/*" class="mb-4 w-full text-gray-700">
            <div id="image-preview-container" class="mb-4 hidden">
                <img id="image-preview" src="#" alt="Image Preview" class="max-w-full h-auto rounded-lg mx-auto border border-gray-300">
            </div>
            <button id="start-detection-button" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">Detect</button>
        `;
        // IMPORTANT: Re-attach event listeners for dynamically created elements
        setupDetectionContentListeners(); // Re-attach listeners for file input and detect button
        
        uploadedImageFile = null; // Clear the uploaded file
        // Re-get imagePreview and imagePreviewContainer as they are recreated
        imagePreview = document.getElementById('image-preview');
        imagePreviewContainer = document.getElementById('image-preview-container');
        if (imagePreview) imagePreview.src = '#';
        if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
    }


    // Function to open the Tumor Detection modal with conditional content
    function openTumorDetectionModal() {
        if (isLoggedIn) {
            // Reset content to initial upload state when opening if logged in
            resetDetectionModal();
            openModal(tumorDetectionModal);
        } else {
            // If not logged in, close tumor modal and open login modal
            closeModal(tumorDetectionModal); // Ensure tumor modal is closed
            openModal(loginModal);
            console.log("User not logged in. Redirecting to login modal.");
            // Optional: You could store a flag here to redirect back to detection after login
            // sessionStorage.setItem('redirect_to_detection', 'true');
        }
    }

    // Event listener for the "Detect Tumor" button in the hero section
    if (detectTumorButton) {
        detectTumorButton.addEventListener('click', openTumorDetectionModal);
        console.log("Detect Tumor button listener attached.");
    } else {
        console.warn("Detect Tumor button not found!");
    }

    // Event listener for closing the Tumor Detection modal
    if (closeTumorModalButton) {
        closeTumorModalButton.addEventListener('click', () => {
            closeModal(tumorDetectionModal);
            resetDetectionModal(); // Reset content when closing
        });
        console.log("Close tumor modal button listener attached.");
    } else {
        console.warn("Close tumor modal button not found!");
    }

    // Close Tumor Detection modal if user clicks outside the modal content
    if (tumorDetectionModal) {
        tumorDetectionModal.addEventListener('click', function(e) {
            if (e.target === tumorDetectionModal) {
                closeModal(tumorDetectionModal);
                resetDetectionModal(); // Reset content when closing
            }
        });
        console.log("Tumor detection modal overlay click listener attached.");
    }

    // Initial setup for the detection modal content listeners when the page loads
    // This ensures that if the modal is opened for the first time, its internal elements
    // have their listeners correctly attached.
    setupDetectionContentListeners();
});