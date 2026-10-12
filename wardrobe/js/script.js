const wardrobeKey = "wardrobeItems";
const outfitsKey = "savedOutfits";
const eventsKey = "eventItems";
const notesKey = "noteItems";
const pinterestIdeasUrl = "https://www.pinterest.com/search/pins/?q=quiet%20luxury%20outfit%20aesthetic";
const outfitIdeas = [
  {
    title: "Cream tailoring",
    category: "Tailored",
    description: "Relaxed white layers with clean lines.",
    image: "https://images.unsplash.com/photo-1627130697816-4d71dbfe6a5b?auto=format&fit=crop&w=900&q=80",
    alt: "Woman wearing a white shirt and white trousers beside a brown wall",
    photographer: "Ron McClenny",
    photoPage: "https://unsplash.com/photos/woman-in-white-long-sleeve-shirt-and-white-pants-standing-beside-brown-wall-UpL2_sNSgHg"
  },
  {
    title: "City layers",
    category: "Street",
    description: "A light coat and a practical crossbody bag.",
    image: "https://images.unsplash.com/photo-1578102718171-ec1f91680562?auto=format&fit=crop&w=900&q=80",
    alt: "Woman wearing a white coat and carrying a crossbody bag",
    photographer: "Laura Chouette",
    photoPage: "https://unsplash.com/photos/woman-wearing-white-coat-carrying-crossbody-bag-d7wSG9uPev4"
  },
  {
    title: "Weekend uniform",
    category: "Everyday",
    description: "A soft cardigan, denim and grounded shoes.",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
    alt: "Gray cardigan, blue jeans and brown shoes arranged as an outfit",
    photographer: "Heather Ford",
    photoPage: "https://unsplash.com/photos/gray-cardigan-blue-jeans-and-pair-of-brown-chunky-heeled-shoes-5gkYsrH_ebY"
  },
  {
    title: "Simple staples",
    category: "Everyday",
    description: "A crisp tee with classic leather boots.",
    image: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=900&q=80",
    alt: "White crew neck T-shirt with brown leather boots",
    photographer: "Sarah Dorweiler",
    photoPage: "https://unsplash.com/photos/white-crew-neck-t-shirt-and-brown-leather-boots-gUPiTDBdRe4"
  },
  {
    title: "Soft winter",
    category: "Street",
    description: "A long coat and a small statement accessory.",
    image: "https://images.unsplash.com/photo-1653875842174-429c1b467548?auto=format&fit=crop&w=900&q=80",
    alt: "Woman wearing a coat and hat in a minimal street-style look",
    photographer: "Renata K. Needham",
    photoPage: "https://unsplash.com/photos/a-woman-wearing-a-hat-and-a-coat-5KZc_2tsayo"
  },
  {
    title: "A little color",
    category: "Color",
    description: "A white shirt balanced with a fresh green accent.",
    image: "https://images.unsplash.com/photo-1684283377169-e3dcfec7790c?auto=format&fit=crop&w=900&q=80",
    alt: "Woman wearing a white shirt and green trousers",
    photographer: "Ali Pazani",
    photoPage: "https://unsplash.com/photos/a-woman-in-a-white-shirt-and-green-pants-RSc2fWHs12o"
  },
  {
    title: "Camel & cocoa",
    category: "Menswear",
    description: "A warm coat, a soft knit and dark tailored trousers.",
    image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?auto=format&fit=crop&w=900&q=80",
    alt: "Man wearing a camel coat over a brown knit",
    photographer: "Taras Chernus",
    photoPage: "https://unsplash.com/photos/man-in-brown-coat-standing--au3XMzfhro"
  }
];

let wardrobe = getSavedData(wardrobeKey, []);
let outfits = getSavedData(outfitsKey, []);
let events = getSavedData(eventsKey, []);
let notes = getSavedData(notesKey, []);

const fallbackImage = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><rect width='300' height='300' fill='#e8e2dc'/><text x='150' y='150' text-anchor='middle' font-size='26' fill='#2b4b40' font-family='Arial'>No photo</text></svg>");

function getSavedData(key, defaultValue) {
  const saved = localStorage.getItem(key);

  if (!saved) {
    return defaultValue;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return defaultValue;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(dateText) {
  if (!dateText) {
    return "No date";
  }

  const date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderStyleIdeas(category) {
  const featureItems = document.getElementById("featureItems");

  if (!featureItems) {
    return;
  }

  const selectedIdeas = outfitIdeas.filter(function (idea) {
    return category === "All" || idea.category === category;
  });

  featureItems.innerHTML = selectedIdeas
    .map(function (idea) {
      return "<article class='look-card'>" +
        "<a class='look-image' href='outfits.html' aria-label='Try the " + idea.title + " outfit idea'>" +
        "<img src='" + idea.image + "' alt='" + idea.alt + "' loading='lazy' />" +
        "<span class='look-arrow' aria-hidden='true'>&#8599;</span>" +
        "</a>" +
        "<div class='look-caption'>" +
        "<span class='look-category'>" + idea.category + " / OUTFIT IDEA</span>" +
        "<h3>" + idea.title + "</h3>" +
        "<p>" + idea.description + "</p>" +
        "<div class='look-links'><a class='look-try' href='outfits.html'>Try this look &#8594;</a>" +
        "<a class='photo-credit' href='" + idea.photoPage + "' target='_blank' rel='noopener noreferrer'>Photo: " + idea.photographer + "</a></div>" +
        "</div>" +
        "</article>";
    })
    .join("");
}

function renderDashboard() {
  const totalClothes = document.getElementById("totalClothes");
  const totalOutfits = document.getElementById("totalOutfits");
  const totalEvents = document.getElementById("totalEvents");
  const todayOutfit = document.getElementById("todayOutfit");
  const dashboardEvents = document.getElementById("dashboardEvents");
  const favoriteItems = document.getElementById("favoriteItems");

  if (!totalClothes) {
    return;
  }

  totalClothes.textContent = wardrobe.length;
  totalOutfits.textContent = outfits.length;
  totalEvents.textContent = events.length;

  renderStyleIdeas("All");

  const favoriteWardrobe = wardrobe.filter(function (item) {
    return item.favorite === true;
  });

  if (favoriteWardrobe.length > 0) {
    favoriteItems.innerHTML = favoriteWardrobe
      .slice(0, 4)
      .map(function (item) {
        return "<span class='favorite-tag'>" + item.name + "</span>";
      })
      .join("");
  } else {
    favoriteItems.innerHTML = "<p class='empty-note'>No favorite items yet.</p>";
  }

  const upcomingEvents = events.slice().sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  if (upcomingEvents.length > 0) {
    dashboardEvents.innerHTML = upcomingEvents
      .slice(0, 3)
      .map(function (event) {
        return "<li><strong>" + event.name + "</strong><span>" + formatDate(event.date) + "</span></li>";
      })
      .join("");
  } else {
    dashboardEvents.innerHTML = "<li>No upcoming events.</li>";
  }

  const outfitName = getTodayOutfitName();
  if (outfitName) {
    todayOutfit.textContent = outfitName;
  }
}

function getTodayOutfitName() {
  if (outfits.length === 0) {
    return "";
  }

  return outfits[0].name;
}

function renderWardrobe() {
  const wardrobeItems = document.getElementById("wardrobeItems");
  const favoriteClothes = document.getElementById("favoriteClothes");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (!wardrobeItems) {
    return;
  }

  let searchText = "";
  let category = "All";

  if (searchInput) {
    searchText = searchInput.value.toLowerCase();
  }

  if (categoryFilter) {
    category = categoryFilter.value;
  }

  const filteredItems = wardrobe.filter(function (item) {
    const matchesSearch = item.name.toLowerCase().includes(searchText);
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filteredItems.length === 0) {
    wardrobeItems.innerHTML = "<p class='empty-note'>No clothes found.</p>";
  } else {
    wardrobeItems.innerHTML = filteredItems
      .map(function (item) {
        const image = item.photo ? item.photo : fallbackImage;
        const favoriteText = item.favorite ? "★ Favorite" : "☆ Favorite";

        return "<div class='clothing-card'>" +
          "<img src='" + image + "' alt='" + item.name + "' />" +
          "<div class='clothing-info'>" +
          "<h3>" + item.name + "</h3>" +
          "<p class='clothing-meta'>" + item.category + " • " + item.color + "</p>" +
          "<p class='clothing-meta'>Style: " + item.style + "</p>" +
          "<div class='clothing-actions'>" +
          "<button class='favorite-btn " + (item.favorite ? "active" : "") + "' data-id='" + item.id + "'>" + favoriteText + "</button>" +
          "<button class='delete-btn' data-id='" + item.id + "'>Delete</button>" +
          "</div>" +
          "</div>" +
          "</div>";
      })
      .join("");
  }

  const favoriteItems = wardrobe.filter(function (item) {
    return item.favorite === true;
  });

  if (favoriteClothes) {
    if (favoriteItems.length === 0) {
      favoriteClothes.innerHTML = "<p class='empty-note'>No favorite clothes yet.</p>";
    } else {
      favoriteClothes.innerHTML = favoriteItems
        .map(function (item) {
          return "<span class='favorite-tag'>" + item.name + "</span>";
        })
        .join("");
    }
  }
}

function renderOutfits() {
  const topSelect = document.getElementById("topSelect");
  const bottomSelect = document.getElementById("bottomSelect");
  const shoesSelect = document.getElementById("shoesSelect");
  const accessorySelect = document.getElementById("accessorySelect");
  const savedOutfits = document.getElementById("savedOutfits");

  if (!savedOutfits) {
    return;
  }

  if (topSelect && bottomSelect && shoesSelect && accessorySelect) {
    populateSelect(topSelect, "T-Shirts|Shirts", "Top");
    populateSelect(bottomSelect, "Pants", "Bottom");
    populateSelect(shoesSelect, "Shoes", "Shoes");
    populateSelect(accessorySelect, "Accessories", "Accessory");

    topSelect.addEventListener("change", updateOutfitPreview);
    bottomSelect.addEventListener("change", updateOutfitPreview);
    shoesSelect.addEventListener("change", updateOutfitPreview);
    accessorySelect.addEventListener("change", updateOutfitPreview);
    updateOutfitPreview();
  }

  if (outfits.length === 0) {
    savedOutfits.innerHTML = "<p class='empty-note'>No saved outfits yet.</p>";
    return;
  }

  savedOutfits.innerHTML = outfits
    .map(function (outfit) {
      return "<div class='saved-outfit-item'>" +
        "<div><strong>" + outfit.name + "</strong><span>" + outfit.top + " • " + outfit.bottom + " • " + outfit.shoes + "</span></div>" +
        "<button data-outfit-id='" + outfit.id + "'>Use</button>" +
        "</div>";
    })
    .join("");
}

function populateSelect(select, categoryFilter, placeholder) {
  const list = wardrobe.filter(function (item) {
    if (categoryFilter === "T-Shirts|Shirts") {
      return item.category === "T-Shirts" || item.category === "Shirts";
    }
    return item.category === categoryFilter;
  });

  select.innerHTML = "<option value=''>Select " + placeholder + "</option>" +
    list
      .map(function (item) {
        return "<option value='" + item.name + "'>" + item.name + "</option>";
      })
      .join("");
}

function updateOutfitPreview() {
  const topSelect = document.getElementById("topSelect");
  const bottomSelect = document.getElementById("bottomSelect");
  const shoesSelect = document.getElementById("shoesSelect");
  const accessorySelect = document.getElementById("accessorySelect");

  if (!topSelect || !bottomSelect || !shoesSelect || !accessorySelect) {
    return;
  }

  document.getElementById("selectedTop").textContent = topSelect.value || "Not selected";
  document.getElementById("selectedBottom").textContent = bottomSelect.value || "Not selected";
  document.getElementById("selectedShoes").textContent = shoesSelect.value || "Not selected";
  document.getElementById("selectedAccessory").textContent = accessorySelect.value || "Not selected";
}

function renderEvents() {
  const eventList = document.getElementById("eventList");
  const plannedOutfit = document.getElementById("plannedOutfit");

  if (plannedOutfit) {
    plannedOutfit.innerHTML = "<option value=''>Select saved outfit</option>" +
      outfits
        .map(function (outfit) {
          return "<option value='" + outfit.name + "'>" + outfit.name + "</option>";
        })
        .join("");
  }

  if (!eventList) {
    return;
  }

  if (events.length === 0) {
    eventList.innerHTML = "<p class='empty-note'>No events yet.</p>";
    return;
  }

  const sortedEvents = events.slice().sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  eventList.innerHTML = sortedEvents
    .map(function (event) {
      return "<div class='event-item'>" +
        "<strong>" + event.name + "</strong>" +
        "<div>" + formatDate(event.date) + " • " + event.time + "</div>" +
        "<div>Location: " + event.location + "</div>" +
        "<div>Planned outfit: " + (event.plannedOutfit || "Not selected") + "</div>" +
        "<div>Notes: " + (event.notes || "No notes") + "</div>" +
        "</div>";
    })
    .join("");
}

function renderNotes() {
  const noteList = document.getElementById("noteList");

  if (!noteList) {
    return;
  }

  if (notes.length === 0) {
    noteList.innerHTML = "<li class='empty-note'>No notes yet.</li>";
    return;
  }

  noteList.innerHTML = notes
    .map(function (note, index) {
      return "<li class='note-item'><span>" + note + "</span><button data-index='" + index + "'>Delete</button></li>";
    })
    .join("");
}

function addClothing(event) {
  event.preventDefault();

  const name = document.getElementById("clothingName").value.trim();
  const category = document.getElementById("clothingCategory").value;
  const color = document.getElementById("clothingColor").value.trim();
  const style = document.getElementById("clothingStyle").value.trim();
  const file = document.getElementById("clothingPhoto").files[0];

  if (!name || !color || !style) {
    alert("Please fill in all clothing details.");
    return;
  }

  let photo = "";

  if (file) {
    const reader = new FileReader();
    reader.onload = function (eventObject) {
      photo = eventObject.target.result;

      const newItem = {
        id: Date.now(),
        name: name,
        category: category,
        color: color,
        style: style,
        photo: photo,
        favorite: false
      };

      wardrobe.push(newItem);
      saveData(wardrobeKey, wardrobe);
      renderWardrobe();
      renderDashboard();
      document.getElementById("clothingForm").reset();
    };

    reader.readAsDataURL(file);
    return;
  }

  const newItem = {
    id: Date.now(),
    name: name,
    category: category,
    color: color,
    style: style,
    photo: photo,
    favorite: false
  };

  wardrobe.push(newItem);
  saveData(wardrobeKey, wardrobe);
  renderWardrobe();
  renderDashboard();
  document.getElementById("clothingForm").reset();
}

function toggleFavorite(itemId) {
  wardrobe = wardrobe.map(function (item) {
    if (item.id === itemId) {
      item.favorite = !item.favorite;
    }
    return item;
  });

  saveData(wardrobeKey, wardrobe);
  renderWardrobe();
  renderDashboard();
}

function deleteClothing(itemId) {
  wardrobe = wardrobe.filter(function (item) {
    return item.id !== itemId;
  });

  saveData(wardrobeKey, wardrobe);
  renderWardrobe();
  renderDashboard();
}

function saveOutfit() {
  const top = document.getElementById("topSelect").value;
  const bottom = document.getElementById("bottomSelect").value;
  const shoes = document.getElementById("shoesSelect").value;
  const accessory = document.getElementById("accessorySelect").value;
  const outfitNameInput = document.getElementById("outfitName");

  if (!top || !bottom || !shoes) {
    alert("Please choose a top, bottom, and shoes before saving.");
    return;
  }

  const outfitName = outfitNameInput.value.trim() || top + " + " + bottom;

  const newOutfit = {
    id: Date.now(),
    name: outfitName,
    top: top,
    bottom: bottom,
    shoes: shoes,
    accessory: accessory || "None"
  };

  outfits.push(newOutfit);
  saveData(outfitsKey, outfits);
  renderOutfits();
  renderDashboard();
  renderEvents();
  document.getElementById("outfitName").value = "";
}

function addEvent(event) {
  event.preventDefault();

  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;
  const location = document.getElementById("eventLocation").value.trim();
  const notes = document.getElementById("eventNotes").value.trim();
  const plannedOutfit = document.getElementById("plannedOutfit").value;

  if (!name || !date || !time || !location) {
    alert("Please complete the event details.");
    return;
  }

  const newEvent = {
    id: Date.now(),
    name: name,
    date: date,
    time: time,
    location: location,
    notes: notes,
    plannedOutfit: plannedOutfit
  };

  events.push(newEvent);
  saveData(eventsKey, events);
  renderEvents();
  renderDashboard();
  document.getElementById("eventForm").reset();
}

function addNote(event) {
  event.preventDefault();

  const noteInput = document.getElementById("noteInput");
  const noteText = noteInput.value.trim();

  if (!noteText) {
    return;
  }

  notes.push(noteText);
  saveData(notesKey, notes);
  renderNotes();
  noteInput.value = "";
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveData(notesKey, notes);
  renderNotes();
}

function setupWardrobePage() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const clothingForm = document.getElementById("clothingForm");

  if (clothingForm) {
    clothingForm.addEventListener("submit", addClothing);
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderWardrobe);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderWardrobe);
  }

  document.addEventListener("click", function (event) {
    const favoriteButton = event.target.closest(".favorite-btn");
    const deleteButton = event.target.closest(".delete-btn");

    if (favoriteButton) {
      toggleFavorite(Number(favoriteButton.dataset.id));
    }

    if (deleteButton) {
      deleteClothing(Number(deleteButton.dataset.id));
    }
  });

  renderWardrobe();
}

function setupOutfitPage() {
  const saveOutfitBtn = document.getElementById("saveOutfitBtn");

  if (saveOutfitBtn) {
    saveOutfitBtn.addEventListener("click", saveOutfit);
  }

  document.addEventListener("click", function (event) {
    const useOutfitButton = event.target.closest("[data-outfit-id]");
    if (useOutfitButton) {
      const outfitId = Number(useOutfitButton.dataset.outfitId);
      const selectedOutfit = outfits.find(function (outfit) {
        return outfit.id === outfitId;
      });

      if (selectedOutfit) {
        document.getElementById("outfitName").value = selectedOutfit.name;
        document.getElementById("topSelect").value = selectedOutfit.top;
        document.getElementById("bottomSelect").value = selectedOutfit.bottom;
        document.getElementById("shoesSelect").value = selectedOutfit.shoes;
        document.getElementById("accessorySelect").value = selectedOutfit.accessory === "None" ? "" : selectedOutfit.accessory;
        updateOutfitPreview();
      }
    }
  });

  renderOutfits();
}

function setupEventsPage() {
  const eventForm = document.getElementById("eventForm");
  const noteForm = document.getElementById("noteForm");

  if (eventForm) {
    eventForm.addEventListener("submit", addEvent);
  }

  if (noteForm) {
    noteForm.addEventListener("submit", addNote);
  }

  document.addEventListener("click", function (event) {
    const noteDeleteButton = event.target.closest("[data-index]");

    if (noteDeleteButton) {
      const index = Number(noteDeleteButton.dataset.index);
      deleteNote(index);
    }
  });

  renderEvents();
  renderNotes();
}

function setupDashboard() {
  renderDashboard();

  const filterButtons = document.querySelectorAll("[data-look-filter]");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (filterButton) {
        filterButton.classList.remove("active");
        filterButton.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      renderStyleIdeas(button.dataset.lookFilter);
    });
  });
}

function initialisePage() {
  const body = document.body;
  const page = body.dataset.page;

  if (page === "dashboard") {
    setupDashboard();
  }

  if (page === "wardrobe") {
    setupWardrobePage();
  }

  if (page === "outfits") {
    setupOutfitPage();
  }

  if (page === "events") {
    setupEventsPage();
  }
}

initialisePage();
