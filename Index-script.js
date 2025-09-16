document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const searchInput = document.querySelector(".searchInput");
    const overlaySearchInput = document.getElementById("overlaySearch");
    const searchIcons = document.querySelectorAll(".search-icon");
    const searchBox = document.querySelector(".search-box");
    const searchOverlay = document.getElementById("searchOverlay");
    const micIcons = document.querySelectorAll(".mic-icon"); // Ab dono mic icons ko select kiya gaya hai

    // Products from localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.style.cssText = `
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        z-index: 2001;
        display: none;
        font-family: Arial, sans-serif;
    `;

    // Tags container
    const tagsContainer = document.createElement('div');
    tagsContainer.style.cssText = `
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 100%;
        padding: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        background: #fff;
        border-radius: 10px;
        z-index: 2000;
    `;

    // Default tags
    const defaultTags = ["Jeans", "Shirt", "T-Shirt", "Lowers", "Suit", "Kurta", "Jacket", "Blazer", "Shoes", "Saree", "Kids Wear", "Hoodie"];
    defaultTags.forEach(tag => {
        const tagItem = document.createElement("div");
        tagItem.textContent = tag;
        tagItem.style.cssText = `
            padding:10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 50px;
            cursor: pointer;
            font-size: 14px;
            transition: 0.3s;
        `;
        tagItem.addEventListener("mouseover", () => { tagItem.style.background = "#ddd"; });
        tagItem.addEventListener("mouseout", () => { tagItem.style.background = "#f0f0f0"; });
        tagItem.addEventListener("click", () => { handleSearch(tag); });
        tagsContainer.appendChild(tagItem);
    });

    // Positioning
    if (searchBox) { searchBox.style.position = "relative"; }
    if (searchOverlay && searchOverlay.querySelector('.search-box')) {
        searchOverlay.querySelector('.search-box').style.position = "relative";
        searchOverlay.querySelector('.search-box').appendChild(tagsContainer);
        searchOverlay.querySelector('.search-box').appendChild(suggestionsContainer);
    }

    // Show Suggestions
    function showSuggestions(query, targetInput) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';

        if (query.length < 2) {
            tagsContainer.style.display = "flex";
            return;
        }

        tagsContainer.style.display = "none";

        const filteredProducts = products.filter(product => {
            const searchString = `${product.productName.toLowerCase()} ${product.tags.join(' ').toLowerCase()}`;
            return searchString.includes(query.toLowerCase());
        });

        if (filteredProducts.length > 0) {
            const uniqueSuggestions = [...new Set(filteredProducts.map(p => p.productName))];
            uniqueSuggestions.forEach(name => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = name;
                suggestionItem.style.cssText = `
                    padding: 10px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    font-size: 16px;
                `;
                suggestionItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleSearch(name);
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = 'block';
        }
    }

    // Main Search Function
    function handleSearch(query) {
        if (!query.trim()) return;

        const filteredProducts = products.filter(product => {
            const searchString = `${product.productName.toLowerCase()} ${product.tags.join(' ').toLowerCase()}`;
            return searchString.includes(query.toLowerCase());
        });

        localStorage.setItem("filteredProducts", JSON.stringify(filteredProducts));
        localStorage.setItem("searchQuery", query);

        window.location.href = "Product.html";
    }

    // Trigger Search
    function triggerSearch(event) {
        let targetInput;
        // Check which input triggered the event (Enter key or button click)
        if (event && event.target) {
            targetInput = event.target.closest('.search-box').querySelector('input');
        } else if (searchOverlay.classList.contains("active")) {
            targetInput = overlaySearchInput;
        } else {
            targetInput = searchInput;
        }

        if (targetInput) {
            const query = targetInput.value.trim();
            if (query) {
                handleSearch(query);
            } else {
                targetInput.focus();
            }
        }
    }

    // Input + Enter events
    if (searchInput) {
        searchInput.addEventListener("input", (e) => showSuggestions(e.target.value));
        searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") triggerSearch(e); });
    }
    if (overlaySearchInput) {
        overlaySearchInput.addEventListener("input", (e) => showSuggestions(e.target.value));
        overlaySearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") triggerSearch(e); });
    }

    // Search Icon click event
    searchIcons.forEach(icon => {
        icon.addEventListener("click", (e) => {
            triggerSearch(e);
        });
    });
    
    micIcons.forEach(icon => {
    icon.addEventListener("click", (e) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Sorry, your browser does not support Speech Recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";   // तुम चाहो तो "hi-IN" भी कर सकते हो
        recognition.interimResults = true; 
        recognition.continuous = true; // लगातार सुनने के लिए

        const targetInput = e.target.closest('.search-box').querySelector('input');
        targetInput.value = ""; // पुराना text clear

        recognition.start();

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            targetInput.value = transcript; // जो बोलेगा वही टाइप होता जाएगा
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("Speech Recognition Error: " + event.error);
        };

        recognition.onend = () => {
            console.log("Speech recognition stopped.");
            // यहाँ चाहो तो auto search trigger कर सकते हो
            const query = targetInput.value.trim();
            if (query) {
                handleSearch(query);
            }
        };
    });
});

    

    // Back Button Reset
    window.addEventListener("popstate", () => {
        if (searchInput) searchInput.value = "";
        if (overlaySearchInput) overlaySearchInput.value = "";
        suggestionsContainer.style.display = "none";
        tagsContainer.style.display = "flex";
    });
});









