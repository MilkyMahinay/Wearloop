// Wearloop - Outfit Planner
// localStorage keys
const STORAGE_KEYS = {
    CLOTHING: 'virtual_wardrobe_clothing',
    OUTFITS: 'virtual_wardrobe_outfits',
    OUTFIT_PHOTOS: 'virtual_wardrobe_outfit_photos',
    EVENTS: 'virtual_wardrobe_events',
    NOTES: 'virtual_wardrobe_notes',
    FAVORITES: 'virtual_wardrobe_favorites'
};

// Data storage
let clothingItems = [];
let outfits = [];
let outfitPhotos = [];
let events = [];
let notes = [];
let favorites = {
    clothing: [],
    outfits: [],
    photos: []
};

// Current outfit being built
let currentOutfit = {
    top: null,
    bottom: null,
    shoes: null,
    accessory: null
};

// Calendar state
let currentDate = new Date();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadData();
        initializeNavigation();
        initializeDashboard();
        initializeForms();
        initializeOutfitBuilder();
        initializeCalendar();
        initializeOutfitPhotos();
        initializeEvents();
        initializeNotes();
        initializeFavorites();
        initializeModals();
        renderAllPages();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('There was an error loading the application. Please refresh the page.');
    }
});

// Load data from localStorage
function loadData() {
    try {
        const read = key => JSON.parse(localStorage.getItem(key) || 'null');

        clothingItems = read(STORAGE_KEYS.CLOTHING) || [];
        outfits = read(STORAGE_KEYS.OUTFITS) || [];
        outfitPhotos = read(STORAGE_KEYS.OUTFIT_PHOTOS) || [];
        events = read(STORAGE_KEYS.EVENTS) || [];
        notes = read(STORAGE_KEYS.NOTES) || [];
        const savedFavorites = read(STORAGE_KEYS.FAVORITES) || {};
        favorites = {
            clothing: Array.isArray(savedFavorites.clothing) ? savedFavorites.clothing : [],
            outfits: Array.isArray(savedFavorites.outfits) ? savedFavorites.outfits : [],
            photos: Array.isArray(savedFavorites.photos) ? savedFavorites.photos : []
        };
    } catch (error) {
        console.error('Error loading data:', error);
        initializeEmptyData();
    }
}

// Reset to empty data if localStorage is corrupted
function initializeEmptyData() {
    clothingItems = [];
    outfits = [];
    outfitPhotos = [];
    events = [];
    notes = [];
    favorites = {
        clothing: [],
        outfits: [],
        photos: []
    };
    saveData();
}

// Save data to localStorage
function saveData() {
    try {
        const data = {
            [STORAGE_KEYS.CLOTHING]: clothingItems,
            [STORAGE_KEYS.OUTFITS]: outfits,
            [STORAGE_KEYS.OUTFIT_PHOTOS]: outfitPhotos,
            [STORAGE_KEYS.EVENTS]: events,
            [STORAGE_KEYS.NOTES]: notes,
            [STORAGE_KEYS.FAVORITES]: favorites
        };
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Storage might be full.');
    }
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const actionButtons = document.querySelectorAll('.action-btn');

    // Page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Quick action buttons
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateToPage(page);
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

function navigateToPage(page) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Close mobile menu
    document.getElementById('navMenu').classList.remove('active');

    // Refresh page content
    renderAllPages();
}

// Dashboard
function initializeDashboard() {
    updateCurrentDate();
    renderDashboard();
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

function renderDashboard() {
    renderTodayOutfit();
    renderUpcomingEvents();
    renderRecentlyAdded();
    renderFavoriteOutfits();
}

function renderTodayOutfit() {
    const container = document.getElementById('todayOutfit');
    const today = new Date().toDateString();
    
    const todayEvent = events.find(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today && event.outfitId;
    });

    if (todayEvent && todayEvent.outfitId) {
        const outfit = outfits.find(o => o.id === todayEvent.outfitId);
        if (outfit) {
            container.innerHTML = `
                <div class="outfit-preview-small">
                    <h4>${outfit.name}</h4>
                    <div class="outfit-items">
                        ${outfit.items.map(item => `
                            <img src="${item.photo}" alt="${item.name}" class="outfit-item-preview">
                        `).join('')}
                    </div>
                </div>
            `;
            return;
        }
    }

    container.innerHTML = '<p class="no-data">No outfit planned for today</p>';
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const today = new Date();
    
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="no-data">No upcoming events</p>';
        return;
    }

    container.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.date);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return `
            <div class="event-item">
                <div>
                    <strong>${event.name}</strong>
                    <small> - ${eventDate.toLocaleDateString('en-US', options)}</small>
                </div>
                ${event.outfitId ? '<span class="icon">👔</span>' : ''}
            </div>
        `;
    }).join('');
}

function renderRecentlyAdded() {
    const container = document.getElementById('recentlyAdded');
    const recent = clothingItems.slice(-4).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No clothes added yet</p>';
        return;
    }

    container.innerHTML = recent.map(item => `
        <div class="recent-item" onclick="showClothingDetails('${item.id}')">
            <img src="${item.photo}" alt="${item.name}">
        </div>
    `).join('');
}

function renderFavoriteOutfits() {
    const container = document.getElementById('dashboardFavoriteOutfits');
    const favoriteOutfitIds = favorites.outfits;
    const favoriteOutfitsList = outfits.filter(o => favoriteOutfitIds.includes(o.id)).slice(0, 4);

    if (favoriteOutfitsList.length === 0) {
        container.innerHTML = '<p class="no-data">No favorite outfits yet</p>';
        return;
    }

    container.innerHTML = favoriteOutfitsList.map(outfit => `
        <div class="favorite-item" onclick="showOutfitDetails('${outfit.id}')">
            ${outfit.items[0] ? `<img src="${outfit.items[0].photo}" alt="${outfit.name}">` : ''}
        </div>
    `).join('');
}

// Forms
function setupPhotoUpload(input, preview, altText) {
    const showPreview = file => {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = event => {
            preview.innerHTML = `<img src="${event.target.result}" alt="${altText}">`;
        };
        reader.readAsDataURL(file);
    };

    preview.addEventListener('click', () => input.click());
    input.addEventListener('change', () => showPreview(input.files[0]));
    preview.addEventListener('dragover', event => {
        event.preventDefault();
        preview.classList.add('drag-over');
    });
    preview.addEventListener('dragleave', () => preview.classList.remove('drag-over'));
    preview.addEventListener('drop', event => {
        event.preventDefault();
        preview.classList.remove('drag-over');

        const file = event.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        showPreview(file);
    });
}

function initializeForms() {
    // Add clothing form
    const addClothingForm = document.getElementById('addClothingForm');
    const photoInput = document.getElementById('clothingPhoto');
    const photoPreview = document.getElementById('clothingPhotoPreview');

    if (photoPreview && photoInput) {
        setupPhotoUpload(photoInput, photoPreview, 'Clothing preview');
    }

    if (addClothingForm) {
        // Form submission
        addClothingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addClothing();
        });
    }

    // Wardrobe filters
    const wardrobeSearch = document.getElementById('wardrobeSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const colorFilter = document.getElementById('colorFilter');
    const styleFilter = document.getElementById('styleFilter');

    if (wardrobeSearch) wardrobeSearch.addEventListener('input', renderWardrobe);
    if (categoryFilter) categoryFilter.addEventListener('change', renderWardrobe);
    if (colorFilter) colorFilter.addEventListener('change', renderWardrobe);
    if (styleFilter) styleFilter.addEventListener('change', renderWardrobe);

    // Outfit filters
    const outfitSearch = document.getElementById('outfitSearch');
    const outfitStyleFilter = document.getElementById('outfitStyleFilter');

    if (outfitSearch) outfitSearch.addEventListener('input', renderSavedOutfits);
    if (outfitStyleFilter) outfitStyleFilter.addEventListener('change', renderSavedOutfits);
}

function addClothing() {
    const photoInput = document.getElementById('clothingPhoto');
    const name = document.getElementById('clothingName').value;
    const category = document.getElementById('clothingCategory').value;
    const color = document.getElementById('clothingColor').value;
    const style = document.getElementById('clothingStyle').value;
    const notes = document.getElementById('clothingNotes').value;

    if (!photoInput.files[0]) {
        alert('Please add a photo');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const clothingItem = {
            id: generateId(),
            photo: e.target.result,
            name,
            category,
            color,
            style,
            notes,
            dateAdded: new Date().toISOString()
        };

        clothingItems.push(clothingItem);
        saveData();
        
        // Reset form
        document.getElementById('addClothingForm').reset();
        document.getElementById('clothingPhotoPreview').innerHTML = '<span class="upload-placeholder">Click or drag to upload photo</span>';
        
        alert('Clothing added successfully!');
        navigateToPage('wardrobe');
    };
    reader.readAsDataURL(photoInput.files[0]);
}

// Wardrobe
function renderWardrobe() {
    const container = document.getElementById('wardrobeGrid');
    const searchTerm = document.getElementById('wardrobeSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const colorFilter = document.getElementById('colorFilter').value;
    const styleFilter = document.getElementById('styleFilter').value;

    let filtered = clothingItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                             item.notes.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesColor = !colorFilter || item.color === colorFilter;
        const matchesStyle = !styleFilter || item.style === styleFilter;
        
        return matchesSearch && matchesCategory && matchesColor && matchesStyle;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No clothing items found</p>';
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="clothing-card" onclick="showClothingDetails('${item.id}')">
            <img src="${item.photo}" alt="${item.name}">
            <div class="clothing-card-content">
                <div class="clothing-card-title">${item.name}</div>
                <div class="clothing-card-details">
                    ${capitalizeFirst(item.category)} • ${capitalizeFirst(item.color)} • ${capitalizeFirst(item.style)}
                </div>
                <div class="clothing-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editClothing('${item.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteClothing('${item.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showClothingDetails(id) {
    const item = clothingItems.find(i => i.id === id);
    if (!item) return;

    const isFavorite = favorites.clothing.includes(id);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${item.name}</h2>
        <img src="${item.photo}" alt="${item.name}" style="max-width: 100%; border-radius: 0.5rem; margin: 1rem 0;">
        <p><strong>Category:</strong> ${capitalizeFirst(item.category)}</p>
        <p><strong>Color:</strong> ${capitalizeFirst(item.color)}</p>
        <p><strong>Style:</strong> ${capitalizeFirst(item.style)}</p>
        <p><strong>Notes:</strong> ${item.notes || 'None'}</p>
        <p><strong>Date Added:</strong> ${new Date(item.dateAdded).toLocaleDateString()}</p>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" onclick="editClothing('${item.id}')">Edit</button>
            <button class="btn btn-secondary ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('clothing', '${item.id}')">
                ${isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
            <button class="btn btn-danger" onclick="deleteClothing('${item.id}')">Delete</button>
        </div>
    `;

    openModal();
}

function editClothing(id) {
    const item = clothingItems.find(i => i.id === id);
    if (!item) return;

    closeModal();
    navigateToPage('add-clothing');

    // Pre-fill form
    document.getElementById('clothingName').value = item.name;
    document.getElementById('clothingCategory').value = item.category;
    document.getElementById('clothingColor').value = item.color;
    document.getElementById('clothingStyle').value = item.style;
    document.getElementById('clothingNotes').value = item.notes;
    
    // Show existing photo
    document.getElementById('clothingPhotoPreview').innerHTML = `<img src="${item.photo}" alt="Preview">`;

    // Change form to edit mode
    const form = document.getElementById('addClothingForm');
    form.dataset.editId = id;
    form.onsubmit = (e) => {
        e.preventDefault();
        updateClothing(id);
    };
}

function updateClothing(id) {
    const item = clothingItems.find(i => i.id === id);
    if (!item) return;

    const photoInput = document.getElementById('clothingPhoto');
    const name = document.getElementById('clothingName').value;
    const category = document.getElementById('clothingCategory').value;
    const color = document.getElementById('clothingColor').value;
    const style = document.getElementById('clothingStyle').value;
    const notes = document.getElementById('clothingNotes').value;

    const updateItem = (photo) => {
        item.name = name;
        item.category = category;
        item.color = color;
        item.style = style;
        item.notes = notes;
        if (photo) item.photo = photo;

        saveData();
        
        // Reset form
        const form = document.getElementById('addClothingForm');
        form.reset();
        form.dataset.editId = '';
        form.onsubmit = (e) => {
            e.preventDefault();
            addClothing();
        };
        document.getElementById('clothingPhotoPreview').innerHTML = '<span class="upload-placeholder">Click or drag to upload photo</span>';
        
        alert('Clothing updated successfully!');
        navigateToPage('wardrobe');
    };

    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => updateItem(e.target.result);
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        updateItem(null);
    }
}

function deleteClothing(id) {
    if (!confirm('Are you sure you want to delete this clothing item?')) return;

    clothingItems = clothingItems.filter(i => i.id !== id);
    favorites.clothing = favorites.clothing.filter(clothingId => clothingId !== id);
    
    // Remove from outfits
    outfits.forEach(outfit => {
        outfit.items = outfit.items.filter(item => item.id !== id);
    });
    
    saveData();
    closeModal();
    renderAllPages();
    alert('Clothing deleted successfully!');
}

// Outfit Builder
function initializeOutfitBuilder() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tabs .tab-btn');
    categoryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderClothingSelector(btn.dataset.category);
        });
    });

    // Save outfit
    const saveOutfitBtn = document.getElementById('saveOutfitBtn');
    if (saveOutfitBtn) {
        saveOutfitBtn.addEventListener('click', saveOutfit);
    }
    
    // Clear outfit
    const clearOutfitBtn = document.getElementById('clearOutfitBtn');
    if (clearOutfitBtn) {
        clearOutfitBtn.addEventListener('click', clearOutfit);
    }

    renderClothingSelector('all');
    updateOutfitPreview();
}

function renderClothingSelector(category) {
    const container = document.getElementById('clothingSelector');
    
    if (!container) {
        console.error('Clothing selector container not found');
        return;
    }
    
    let filtered = clothingItems;
    if (category !== 'all') {
        const categoryMap = {
            'top': ['tshirt', 'shirt', 'hoodie', 'jacket'],
            'bottom': ['pants', 'jeans', 'shorts'],
            'shoes': ['shoes'],
            'accessory': ['accessories', 'other']
        };
        filtered = clothingItems.filter(item => categoryMap[category].includes(item.category));
    }

    if (filtered.length === 0) {
        if (clothingItems.length === 0) {
            container.innerHTML = `
                <p class="no-data">
                    No clothing available yet.<br>
                    <a href="#add-clothing" style="color: var(--primary-color);">Add clothing to your wardrobe first</a>
                </p>
            `;
        } else {
            container.innerHTML = '<p class="no-data">No clothing available in this category</p>';
        }
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="selector-item" onclick="addToOutfit('${item.id}')">
            <img src="${item.photo}" alt="${item.name}">
            <div class="selector-item-name">${item.name}</div>
        </div>
    `).join('');
}

function addToOutfit(itemId) {
    const item = clothingItems.find(i => i.id === itemId);
    if (!item) return;

    // Determine category based on item's category
    let slot;
    if (['tshirt', 'shirt', 'hoodie', 'jacket'].includes(item.category)) {
        slot = 'top';
    } else if (['pants', 'jeans', 'shorts'].includes(item.category)) {
        slot = 'bottom';
    } else if (item.category === 'shoes') {
        slot = 'shoes';
    } else {
        slot = 'accessory';
    }

    currentOutfit[slot] = item;
    updateOutfitPreview();
}

function updateOutfitPreview() {
    const slots = ['top', 'bottom', 'shoes', 'accessory'];
    
    slots.forEach(slot => {
        const slotElement = document.getElementById(`${slot}Slot`);
        const item = currentOutfit[slot];
        
        if (item) {
            slotElement.innerHTML = `
                <img src="${item.photo}" alt="${item.name}" title="${item.name}">
                <button class="btn btn-danger btn-sm" onclick="removeFromOutfit('${slot}')" style="margin-top: 0.5rem;">Remove</button>
            `;
        } else {
            slotElement.innerHTML = 'Empty';
        }
    });
}

function removeFromOutfit(slot) {
    currentOutfit[slot] = null;
    updateOutfitPreview();
}

function clearOutfit() {
    currentOutfit = {
        top: null,
        bottom: null,
        shoes: null,
        accessory: null
    };
    document.getElementById('outfitName').value = '';
    updateOutfitPreview();
}

function saveOutfit() {
    const items = Object.values(currentOutfit).filter(item => item !== null);
    
    if (items.length === 0) {
        alert('Please add at least one clothing item to your outfit');
        return;
    }

    const name = document.getElementById('outfitName').value;
    if (!name) {
        alert('Please name your outfit');
        return;
    }

    const outfit = {
        id: generateId(),
        name,
        items,
        style: determineOutfitStyle(items),
        notes: '',
        dateCreated: new Date().toISOString()
    };

    outfits.push(outfit);
    saveData();
    clearOutfit();
    alert('Outfit saved successfully!');
    navigateToPage('saved-outfits');
}

function determineOutfitStyle(items) {
    const styles = items.map(item => item.style);
    if (styles.includes('formal')) return 'formal';
    if (styles.includes('party')) return 'party';
    if (styles.includes('sports')) return 'sports';
    if (styles.includes('smart-casual')) return 'smart-casual';
    return 'casual';
}

// Saved Outfits
function renderOutfitStack(items, detail = false) {
    const order = { tshirt: 0, shirt: 0, hoodie: 0, jacket: 0, pants: 1, jeans: 1, shorts: 1, shoes: 2 };
    const labels = ['Top', 'Bottom', 'Shoes', 'Accessory'];
    const sortedItems = [...items].sort((a, b) => (order[a.category] ?? 3) - (order[b.category] ?? 3));

    return `
        <div class="outfit-stack-preview${detail ? ' detail' : ''}">
            ${sortedItems.map(item => `
                <div class="outfit-stack-item">
                    <span>${labels[order[item.category] ?? 3]}</span>
                    <img src="${item.photo}" alt="${item.name}">
                </div>
            `).join('')}
        </div>
    `;
}

function renderSavedOutfits() {
    const container = document.getElementById('savedOutfitsGrid');
    const searchTerm = document.getElementById('outfitSearch').value.toLowerCase();
    const styleFilter = document.getElementById('outfitStyleFilter').value;

    let filtered = outfits.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(searchTerm) ||
                             outfit.notes.toLowerCase().includes(searchTerm);
        const matchesStyle = !styleFilter || outfit.style === styleFilter;
        
        return matchesSearch && matchesStyle;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No saved outfits</p>';
        return;
    }

    container.innerHTML = filtered.map(outfit => {
        const isFavorite = favorites.outfits.includes(outfit.id);
        const previewContent = renderOutfitStack(outfit.items);

        return `
            <div class="outfit-card">
                ${previewContent}
                <div class="outfit-card-content">
                    <div class="outfit-card-title">${outfit.name}</div>
                    <div class="outfit-card-details">
                        Style: ${capitalizeFirst(outfit.style)} • ${outfit.items.length} items
                    </div>
                    <div class="outfit-card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="showOutfitDetails('${outfit.id}')">View</button>
                        <button class="btn btn-secondary btn-sm ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('outfit', '${outfit.id}')">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOutfit('${outfit.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showOutfitDetails(id) {
    const outfit = outfits.find(o => o.id === id);
    if (!outfit) return;

    const isFavorite = favorites.outfits.includes(id);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${outfit.name}</h2>
        ${renderOutfitStack(outfit.items, true)}
        <p><strong>Style:</strong> ${capitalizeFirst(outfit.style)}</p>
        <p><strong>Items:</strong></p>
        <ul>
            ${outfit.items.map(item => `<li>${item.name} (${capitalizeFirst(item.category)})</li>`).join('')}
        </ul>
        <p><strong>Notes:</strong> ${outfit.notes || 'None'}</p>
        <p><strong>Date Created:</strong> ${new Date(outfit.dateCreated).toLocaleDateString()}</p>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="editOutfitNotes('${outfit.id}')">Edit Notes</button>
            <button class="btn btn-secondary ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('outfit', '${outfit.id}')">
                ${isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
            <button class="btn btn-danger" onclick="deleteOutfit('${outfit.id}')">Delete</button>
        </div>
    `;

    openModal();
}

function editOutfitNotes(id) {
    const outfit = outfits.find(o => o.id === id);
    if (!outfit) return;

    const newNotes = prompt('Enter notes for this outfit:', outfit.notes);
    if (newNotes !== null) {
        outfit.notes = newNotes;
        saveData();
        closeModal();
        showOutfitDetails(id);
    }
}

function deleteOutfit(id) {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    outfits = outfits.filter(o => o.id !== id);
    favorites.outfits = favorites.outfits.filter(outfitId => outfitId !== id);
    
    // Remove from events
    events.forEach(event => {
        if (event.outfitId === id) {
            event.outfitId = null;
        }
    });
    
    saveData();
    closeModal();
    renderAllPages();
    alert('Outfit deleted successfully!');
}

// Outfit Photos
function initializeOutfitPhotos() {
    document.getElementById('addOutfitPhotoBtn').addEventListener('click', addOutfitPhoto);
}

function addOutfitPhoto() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add Outfit Photo</h2>
        <form id="outfitPhotoForm">
            <div class="form-group">
                <label>Photo</label>
                <input type="file" id="outfitPhotoFile" accept="image/*" required>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="outfitPhotoName" required placeholder="e.g., Black Casual Outfit">
            </div>
            <div class="form-group">
                <label>Date Worn</label>
                <input type="date" id="outfitPhotoDate" required>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="outfitPhotoNotes" rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Add Photo</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    openModal();

    document.getElementById('outfitPhotoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveOutfitPhoto();
    });
}

function saveOutfitPhoto() {
    const photoInput = document.getElementById('outfitPhotoFile');
    const name = document.getElementById('outfitPhotoName').value;
    const date = document.getElementById('outfitPhotoDate').value;
    const notes = document.getElementById('outfitPhotoNotes').value;

    if (!photoInput.files[0]) {
        alert('Please select a photo');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const outfitPhoto = {
            id: generateId(),
            photo: e.target.result,
            name,
            date,
            notes,
            dateAdded: new Date().toISOString()
        };

        outfitPhotos.push(outfitPhoto);
        saveData();
        closeModal();
        renderOutfitPhotos();
        alert('Outfit photo added successfully!');
    };
    reader.readAsDataURL(photoInput.files[0]);
}

function renderOutfitPhotos() {
    const container = document.getElementById('outfitPhotosGrid');

    if (outfitPhotos.length === 0) {
        container.innerHTML = '<p class="no-data">No outfit photos yet</p>';
        return;
    }

    container.innerHTML = outfitPhotos.map(photo => {
        const isFavorite = favorites.photos.includes(photo.id);
        return `
            <div class="outfit-photo-card">
                <img src="${photo.photo}" alt="${photo.name}">
                <div class="outfit-photo-card-content">
                    <div class="outfit-photo-card-title">${photo.name}</div>
                    <div class="outfit-photo-card-details">
                        Worn: ${new Date(photo.date).toLocaleDateString()}
                    </div>
                    <div class="outfit-photo-card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="showOutfitPhotoDetails('${photo.id}')">View</button>
                        <button class="btn btn-secondary btn-sm ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('photo', '${photo.id}')">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOutfitPhoto('${photo.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showOutfitPhotoDetails(id) {
    const photo = outfitPhotos.find(p => p.id === id);
    if (!photo) return;

    const isFavorite = favorites.photos.includes(id);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${photo.name}</h2>
        <img src="${photo.photo}" alt="${photo.name}" style="max-width: 100%; border-radius: 0.5rem; margin: 1rem 0;">
        <p><strong>Date Worn:</strong> ${new Date(photo.date).toLocaleDateString()}</p>
        <p><strong>Notes:</strong> ${photo.notes || 'None'}</p>
        <p><strong>Date Added:</strong> ${new Date(photo.dateAdded).toLocaleDateString()}</p>
        <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="editOutfitPhotoNotes('${photo.id}')">Edit Notes</button>
            <button class="btn btn-secondary ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('photo', '${photo.id}')">
                ${isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
            <button class="btn btn-danger" onclick="deleteOutfitPhoto('${photo.id}')">Delete</button>
        </div>
    `;

    openModal();
}

function editOutfitPhotoNotes(id) {
    const photo = outfitPhotos.find(p => p.id === id);
    if (!photo) return;

    const newNotes = prompt('Enter notes for this outfit photo:', photo.notes);
    if (newNotes !== null) {
        photo.notes = newNotes;
        saveData();
        closeModal();
        showOutfitPhotoDetails(id);
    }
}

function deleteOutfitPhoto(id) {
    if (!confirm('Are you sure you want to delete this outfit photo?')) return;

    outfitPhotos = outfitPhotos.filter(p => p.id !== id);
    favorites.photos = favorites.photos.filter(photoId => photoId !== id);
    
    saveData();
    closeModal();
    renderOutfitPhotos();
    alert('Outfit photo deleted successfully!');
}

// Events
function initializeEvents() {
    document.getElementById('addEventBtn').addEventListener('click', addEvent);
}

function addEvent() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add Event</h2>
        <form id="eventForm">
            <div class="form-group">
                <label>Event Name *</label>
                <input type="text" id="eventName" required placeholder="e.g., Birthday Party">
            </div>
            <div class="form-group">
                <label>Date *</label>
                <input type="date" id="eventDate" required>
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" id="eventTime">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="eventLocation" placeholder="e.g., Restaurant">
            </div>
            <div class="form-group">
                <label>Event Type</label>
                <select id="eventType">
                    <option value="">Select type</option>
                    <option value="university">University</option>
                    <option value="birthday">Birthday</option>
                    <option value="party">Party</option>
                    <option value="dinner">Dinner</option>
                    <option value="wedding">Wedding</option>
                    <option value="date">Date</option>
                    <option value="meeting">Meeting</option>
                    <option value="gym">Gym</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="eventNotes" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Planned Outfit</label>
                <select id="eventOutfit">
                    <option value="">No outfit selected</option>
                    ${outfits.map(outfit => `<option value="${outfit.id}">${outfit.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Add Event</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    openModal();

    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
    });
}

function saveEvent() {
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const type = document.getElementById('eventType').value;
    const notes = document.getElementById('eventNotes').value;
    const outfitId = document.getElementById('eventOutfit').value;

    const event = {
        id: generateId(),
        name,
        date,
        time,
        location,
        type,
        notes,
        outfitId: outfitId || null
    };

    events.push(event);
    saveData();
    closeModal();
    renderEvents();
    alert('Event added successfully!');
}

function renderEvents() {
    const container = document.getElementById('eventsList');

    if (events.length === 0) {
        container.innerHTML = '<p class="no-data">No events planned yet</p>';
        return;
    }

    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sortedEvents.map(event => {
        const outfit = outfits.find(o => o.id === event.outfitId);
        return `
            <div class="event-card">
                <div class="event-card-info">
                    <div class="event-card-title">${event.name}</div>
                    <div class="event-card-details">
                        📅 ${new Date(event.date).toLocaleDateString()} ${event.time ? `at ${event.time}` : ''}
                    </div>
                    ${event.location ? `<div class="event-card-details">📍 ${event.location}</div>` : ''}
                    ${event.type ? `<div class="event-card-details">🏷️ ${capitalizeFirst(event.type)}</div>` : ''}
                    ${outfit ? `<div class="event-card-details">👔 ${outfit.name}</div>` : ''}
                </div>
                <div class="event-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="showEventDetails('${event.id}')">View</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function showEventDetails(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const outfit = outfits.find(o => o.id === event.outfitId);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${event.name}</h2>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ''}
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        ${event.type ? `<p><strong>Type:</strong> ${capitalizeFirst(event.type)}</p>` : ''}
        <p><strong>Notes:</strong> ${event.notes || 'None'}</p>
        <p><strong>Planned Outfit:</strong> ${outfit ? outfit.name : 'None'}</p>
        ${outfit ? `
            <div class="outfit-card-preview" style="margin: 1rem 0;">
                ${outfit.items.map(item => `<img src="${item.photo}" alt="${item.name}">`).join('')}
            </div>
        ` : ''}
        <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
        </div>
    `;

    openModal();
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Event</h2>
        <form id="eventForm">
            <div class="form-group">
                <label>Event Name *</label>
                <input type="text" id="eventName" value="${event.name}" required>
            </div>
            <div class="form-group">
                <label>Date *</label>
                <input type="date" id="eventDate" value="${event.date}" required>
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" id="eventTime" value="${event.time || ''}">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="eventLocation" value="${event.location || ''}">
            </div>
            <div class="form-group">
                <label>Event Type</label>
                <select id="eventType">
                    <option value="">Select type</option>
                    <option value="university" ${event.type === 'university' ? 'selected' : ''}>University</option>
                    <option value="birthday" ${event.type === 'birthday' ? 'selected' : ''}>Birthday</option>
                    <option value="party" ${event.type === 'party' ? 'selected' : ''}>Party</option>
                    <option value="dinner" ${event.type === 'dinner' ? 'selected' : ''}>Dinner</option>
                    <option value="wedding" ${event.type === 'wedding' ? 'selected' : ''}>Wedding</option>
                    <option value="date" ${event.type === 'date' ? 'selected' : ''}>Date</option>
                    <option value="meeting" ${event.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                    <option value="gym" ${event.type === 'gym' ? 'selected' : ''}>Gym</option>
                    <option value="travel" ${event.type === 'travel' ? 'selected' : ''}>Travel</option>
                    <option value="other" ${event.type === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="eventNotes" rows="3">${event.notes || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Planned Outfit</label>
                <select id="eventOutfit">
                    <option value="">No outfit selected</option>
                    ${outfits.map(outfit => `<option value="${outfit.id}" ${event.outfitId === outfit.id ? 'selected' : ''}>${outfit.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update Event</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    openModal();

    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateEvent(id);
    });
}

function updateEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    event.name = document.getElementById('eventName').value;
    event.date = document.getElementById('eventDate').value;
    event.time = document.getElementById('eventTime').value;
    event.location = document.getElementById('eventLocation').value;
    event.type = document.getElementById('eventType').value;
    event.notes = document.getElementById('eventNotes').value;
    event.outfitId = document.getElementById('eventOutfit').value || null;

    saveData();
    closeModal();
    renderEvents();
    alert('Event updated successfully!');
}

function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    events = events.filter(e => e.id !== id);
    saveData();
    closeModal();
    renderEvents();
    alert('Event deleted successfully!');
}

// Calendar
function initializeCalendar() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    
    let html = '';
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        html += '<div class="calendar-cell empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === today.toDateString();
        
        const dayEvents = events.filter(event => event.date === dateStr);
        
        html += `
            <div class="calendar-cell ${isToday ? 'today' : ''}" onclick="showCalendarDay('${dateStr}')">
                <div class="calendar-cell-date">${day}</div>
                <div class="calendar-cell-events">
                    ${dayEvents.slice(0, 2).map(event => `
                        <div class="calendar-event">${event.name}</div>
                    `).join('')}
                    ${dayEvents.length > 2 ? `<div class="calendar-event">+${dayEvents.length - 2} more</div>` : ''}
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

function showCalendarDay(dateStr) {
    const dayEvents = events.filter(event => event.date === dateStr);
    
    if (dayEvents.length === 0) {
        // Add event for this day
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <p>No events for this day</p>
            <button class="btn btn-primary" onclick="addEventForDate('${dateStr}')">Add Event</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        `;
        openModal();
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        ${dayEvents.map(event => {
            const outfit = outfits.find(o => o.id === event.outfitId);
            return `
                <div class="event-card" style="margin-bottom: 1rem;">
                    <div class="event-card-info">
                        <div class="event-card-title">${event.name}</div>
                        <div class="event-card-details">
                            ${event.time ? `at ${event.time}` : ''}
                        </div>
                        ${event.location ? `<div class="event-card-details">📍 ${event.location}</div>` : ''}
                        ${outfit ? `<div class="event-card-details">👔 ${outfit.name}</div>` : ''}
                    </div>
                    <div class="event-card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="showEventDetails('${event.id}')">View</button>
                    </div>
                </div>
            `;
        }).join('')}
        <button class="btn btn-primary" onclick="addEventForDate('${dateStr}')">Add Event</button>
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    `;
    
    openModal();
}

function addEventForDate(dateStr) {
    closeModal();
    addEvent();
    
    // Pre-fill the date
    setTimeout(() => {
        document.getElementById('eventDate').value = dateStr;
    }, 100);
}

// Outfit Planner
function renderOutfitPlanner() {
    const container = document.getElementById('outfitPlannerList');
    const today = new Date();
    
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="no-data">No upcoming events to plan outfits for</p>';
        return;
    }

    container.innerHTML = upcomingEvents.map(event => {
        const outfit = outfits.find(o => o.id === event.outfitId);
        return `
            <div class="planner-item">
                <div class="planner-item-info">
                    <div class="planner-item-title">${event.name}</div>
                    <div class="planner-item-details">
                        📅 ${new Date(event.date).toLocaleDateString()} ${event.time ? `at ${event.time}` : ''}
                    </div>
                    ${event.location ? `<div class="planner-item-details">📍 ${event.location}</div>` : ''}
                </div>
                <div class="planner-item-outfit">
                    ${outfit ? `
                        <div class="planner-item-outfit-preview">
                            ${outfit.items.slice(0, 3).map(item => `
                                <img src="${item.photo}" alt="${item.name}">
                            `).join('')}
                        </div>
                        <strong>${outfit.name}</strong>
                    ` : '<p>No outfit planned</p>'}
                </div>
                <div class="planner-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="selectOutfitForEvent('${event.id}')">
                        ${outfit ? 'Change Outfit' : 'Select Outfit'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function selectOutfitForEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Select Outfit for ${event.name}</h2>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        ${outfits.length === 0 ? '<p>No outfits available. Create some outfits first!</p>' : `
            <div class="outfits-grid" style="margin-top: 1rem;">
                ${outfits.map(outfit => `
                    <div class="outfit-card" onclick="assignOutfitToEvent('${eventId}', '${outfit.id}')">
                        <div class="outfit-card-preview">
                            ${outfit.items.slice(0, 4).map(item => `
                                <img src="${item.photo}" alt="${item.name}">
                            `).join('')}
                        </div>
                        <div class="outfit-card-content">
                            <div class="outfit-card-title">${outfit.name}</div>
                            <div class="outfit-card-details">${capitalizeFirst(outfit.style)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
        <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="closeModal()">Cancel</button>
    `;

    openModal();
}

function assignOutfitToEvent(eventId, outfitId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    event.outfitId = outfitId;
    saveData();
    closeModal();
    renderOutfitPlanner();
    alert('Outfit assigned to event!');
}

// Notes
function initializeNotes() {
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
}

function addNote() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add Note</h2>
        <form id="noteForm">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" id="noteTitle" required placeholder="e.g., Outfit ideas">
            </div>
            <div class="form-group">
                <label>Content *</label>
                <textarea id="noteContent" rows="5" required placeholder="Write your note here..."></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Add Note</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    openModal();

    document.getElementById('noteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNote();
    });
}

function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    const note = {
        id: generateId(),
        title,
        content,
        dateCreated: new Date().toISOString()
    };

    notes.push(note);
    saveData();
    closeModal();
    renderNotes();
    alert('Note added successfully!');
}

function renderNotes() {
    const container = document.getElementById('notesList');

    if (notes.length === 0) {
        container.innerHTML = '<p class="no-data">No notes yet</p>';
        return;
    }

    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="note-card-title">${note.title}</div>
            <div class="note-card-content">${note.content}</div>
            <div class="note-card-date">${new Date(note.dateCreated).toLocaleDateString()}</div>
            <div class="note-card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editNote('${note.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Note</h2>
        <form id="noteForm">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" id="noteTitle" value="${note.title}" required>
            </div>
            <div class="form-group">
                <label>Content *</label>
                <textarea id="noteContent" rows="5" required>${note.content}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update Note</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    openModal();

    document.getElementById('noteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateNote(id);
    });
}

function updateNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    note.title = document.getElementById('noteTitle').value;
    note.content = document.getElementById('noteContent').value;

    saveData();
    closeModal();
    renderNotes();
    alert('Note updated successfully!');
}

function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    notes = notes.filter(n => n.id !== id);
    saveData();
    renderNotes();
    alert('Note deleted successfully!');
}

// Favorites
function initializeFavorites() {
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.favorites-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.favorites-section').forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`favorite${capitalizeFirst(btn.dataset.tab)}`).classList.add('active');
        });
    });

    renderFavorites();
}

function renderFavorites() {
    renderFavoriteClothing();
    renderFavoriteOutfitsList();
    renderFavoritePhotos();
}

function renderFavoriteClothing() {
    const container = document.getElementById('favoriteClothingGrid');
    const favoriteClothingItems = clothingItems.filter(item => favorites.clothing.includes(item.id));

    if (favoriteClothingItems.length === 0) {
        container.innerHTML = '<p class="no-data">No favorite clothing yet</p>';
        return;
    }

    container.innerHTML = favoriteClothingItems.map(item => `
        <div class="clothing-card" onclick="showClothingDetails('${item.id}')">
            <img src="${item.photo}" alt="${item.name}">
            <div class="clothing-card-content">
                <div class="clothing-card-title">${item.name}</div>
                <div class="clothing-card-details">
                    ${capitalizeFirst(item.category)} • ${capitalizeFirst(item.color)}
                </div>
                <div class="clothing-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); toggleFavorite('clothing', '${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFavoriteOutfitsList() {
    const container = document.getElementById('favoriteOutfitsGrid');
    const favoriteOutfitsList = outfits.filter(outfit => favorites.outfits.includes(outfit.id));

    if (favoriteOutfitsList.length === 0) {
        container.innerHTML = '<p class="no-data">No favorite outfits yet</p>';
        return;
    }

    container.innerHTML = favoriteOutfitsList.map(outfit => `
        <div class="outfit-card">
            <div class="outfit-card-preview">
                ${outfit.items.slice(0, 4).map(item => `
                    <img src="${item.photo}" alt="${item.name}">
                `).join('')}
            </div>
            <div class="outfit-card-content">
                <div class="outfit-card-title">${outfit.name}</div>
                <div class="outfit-card-details">
                    Style: ${capitalizeFirst(outfit.style)}
                </div>
                <div class="outfit-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="showOutfitDetails('${outfit.id}')">View</button>
                    <button class="btn btn-secondary btn-sm" onclick="toggleFavorite('outfit', '${outfit.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFavoritePhotos() {
    const container = document.getElementById('favoritePhotosGrid');
    const favoritePhotosList = outfitPhotos.filter(photo => favorites.photos.includes(photo.id));

    if (favoritePhotosList.length === 0) {
        container.innerHTML = '<p class="no-data">No favorite outfit photos yet</p>';
        return;
    }

    container.innerHTML = favoritePhotosList.map(photo => `
        <div class="outfit-photo-card">
            <img src="${photo.photo}" alt="${photo.name}">
            <div class="outfit-photo-card-content">
                <div class="outfit-photo-card-title">${photo.name}</div>
                <div class="outfit-photo-card-details">
                    Worn: ${new Date(photo.date).toLocaleDateString()}
                </div>
                <div class="outfit-photo-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="showOutfitPhotoDetails('${photo.id}')">View</button>
                    <button class="btn btn-secondary btn-sm" onclick="toggleFavorite('photo', '${photo.id}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleFavorite(type, id) {
    const key = { clothing: 'clothing', outfit: 'outfits', photo: 'photos' }[type];
    
    if (favorites[key].includes(id)) {
        favorites[key] = favorites[key].filter(itemId => itemId !== id);
    } else {
        favorites[key].push(id);
    }
    
    saveData();
    renderAllPages();
    
    // Refresh modal if open
    if (document.getElementById('modal').classList.contains('active')) {
        if (type === 'clothing') {
            showClothingDetails(id);
        } else if (type === 'outfit') {
            showOutfitDetails(id);
        } else if (type === 'photo') {
            showOutfitPhotoDetails(id);
        }
    }
}

// Modal
function initializeModals() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function openModal() {
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Render all pages
function renderAllPages() {
    renderDashboard();
    renderWardrobe();
    renderClothingSelector('all');
    renderSavedOutfits();
    renderOutfitPhotos();
    renderEvents();
    renderCalendar();
    renderOutfitPlanner();
    renderNotes();
    renderFavorites();
}
