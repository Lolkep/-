/* ========================================
   КП "Комфортний Стрий" — JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ==================== MOBILE MENU TOGGLE ====================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('open');
      nav.classList.toggle('open');
    });

    // Close menu when clicking a nav link (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('open');
        nav.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
        menuToggle.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  // ==================== BACK TO TOP BUTTON ====================
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== LOAD NEWS ====================
  const homeNewsGrid = document.getElementById('homeNewsGrid');
  const newsList = document.getElementById('newsList');

  if (homeNewsGrid || newsList) {
    loadNews();
  }

  // ==================== NEWS FILTERS ====================
  const filterButtons = document.querySelectorAll('.news-filter-btn');

  if (filterButtons.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        filterNews(filter);
      });
    });
  }

  // ==================== ACTIVE NAV LINK HIGHLIGHT ====================
  highlightActiveNav();

});

// ==================== FUNCTIONS ====================

/**
 * Load news from news.json
 */
function loadNews() {
  fetch('data/news.json')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Помилка завантаження новин');
      }
      return response.json();
    })
    .then(function (news) {
      // Sort by date descending
      news.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      // Store news globally for filtering
      window.allNews = news;

      // Render on home page (latest 3)
      const homeNewsGrid = document.getElementById('homeNewsGrid');
      if (homeNewsGrid) {
        renderNewsCards(homeNewsGrid, news.slice(0, 3));
      }

      // Render on news page (all)
      const newsList = document.getElementById('newsList');
      if (newsList) {
        renderNewsList(newsList, news);
      }
    })
    .catch(function (error) {
      console.error('Помилка:', error);
      // Fallback: show sample news if JSON fails to load
      const fallbackNews = getFallbackNews();
      window.allNews = fallbackNews;

      const homeNewsGrid = document.getElementById('homeNewsGrid');
      if (homeNewsGrid && homeNewsGrid.children.length === 0) {
        renderNewsCards(homeNewsGrid, fallbackNews.slice(0, 3));
      }

      const newsList = document.getElementById('newsList');
      if (newsList && newsList.children.length === 0) {
        renderNewsList(newsList, fallbackNews);
      }
    });
}

/**
 * Render news as cards (for home page)
 */
function renderNewsCards(container, news) {
  if (!container) return;
  container.innerHTML = '';

  news.forEach(function (item) {
    var card = document.createElement('div');
    card.className = 'news-card';

    var dateSpan = document.createElement('span');
    dateSpan.className = 'news-card-date';
    dateSpan.textContent = formatDate(item.date);

    var body = document.createElement('div');
    body.className = 'news-card-body';

    var title = document.createElement('h3');
    title.textContent = item.title;

    var text = document.createElement('p');
    text.textContent = truncateText(item.text, 120);

    var link = document.createElement('a');
    link.href = 'news.html';
    link.className = 'read-more';
    link.textContent = 'Читати далі →';

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(link);

    card.appendChild(dateSpan);
    card.appendChild(body);
    container.appendChild(card);
  });
}

/**
 * Render news as list (for news page)
 */
function renderNewsList(container, news) {
  if (!container) return;
  container.innerHTML = '';

  news.forEach(function (item) {
    var newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.setAttribute('data-category', item.category);

    var date = document.createElement('div');
    date.className = 'date';
    date.textContent = formatDate(item.date);

    var category = document.createElement('div');
    category.className = 'date';
    category.style.cssText = 'margin-left: 8px; background: var(--accent);';
    category.textContent = getCategoryLabel(item.category);

    var title = document.createElement('h3');
    title.textContent = item.title;

    var text = document.createElement('p');
    text.textContent = item.text;

    newsItem.appendChild(date);
    newsItem.appendChild(category);
    newsItem.appendChild(title);
    newsItem.appendChild(text);
    container.appendChild(newsItem);
  });
}

/**
 * Filter news by category
 */
function filterNews(filter) {
  var newsList = document.getElementById('newsList');
  var noResults = document.getElementById('noResults');

  if (!newsList) return;

  var items = newsList.querySelectorAll('.news-item');
  var visibleCount = 0;

  items.forEach(function (item) {
    var category = item.getAttribute('data-category');
    if (filter === 'all' || category === filter) {
      item.style.display = 'block';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/**
 * Format date: YYYY-MM-DD -> DD.MM.YYYY
 */
function formatDate(dateStr) {
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '.' + month + '.' + year;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get readable category label
 */
function getCategoryLabel(category) {
  var labels = {
    'news': 'Новина',
    'announcement': 'Оголошення',
    'repair': 'Ремонтні роботи',
    'shutdown': 'Відключення'
  };
  return labels[category] || category;
}

/**
 * Fallback news data (displayed if news.json fails to load)
 */
function getFallbackNews() {
  return [
    {
      "id": 1,
      "title": "Розпочато підготовку до опалювального сезону 2026-2027",
      "text": "КП «Комфортний Стрий» розпочало планову підготовку теплових мереж до наступного опалювального сезону. Проводиться гідравлічне випробування трубопроводів, ревізія запірної арматури та заміна зношених ділянок.",
      "date": "2026-06-20",
      "category": "news"
    },
    {
      "id": 2,
      "title": "Тимчасове відключення водопостачання на вул. Шевченка",
      "text": "29 червня 2026 року з 10:00 до 16:00 у зв'язку з ремонтними роботами на магістральному водопроводі буде тимчасово припинено водопостачання на вул. Шевченка та прилеглих вулицях. Просимо вибачення за тимчасові незручності.",
      "date": "2026-06-27",
      "category": "shutdown"
    },
    {
      "id": 3,
      "title": "Встановлення нових контейнерів для роздільного збору сміття",
      "text": "У рамках програми з покращення екології міста, КП «Комфортний Стрий» встановило 50 нових контейнерів для роздільного збору відходів у мікрорайонах «Центр», «Новий Світ» та «Залізничний».",
      "date": "2026-06-15",
      "category": "announcement"
    },
    {
      "id": 4,
      "title": "Ремонт каналізаційного колектора на вул. Львівській",
      "text": "З 1 по 15 липня 2026 року проводитимуться роботи з ремонту каналізаційного колектора на вул. Львівській. Можливе ускладнення руху транспорту. Об'їзд через вул. Коссака.",
      "date": "2026-06-25",
      "category": "repair"
    },
    {
      "id": 5,
      "title": "Зміна тарифів на водопостачання з 1 липня 2026 року",
      "text": "Повідомляємо, що з 1 липня 2026 року відбудеться планове коригування тарифів на послуги водопостачання та водовідведення. Нові тарифи опубліковані в розділі «Послуги». Детальну інформацію можна отримати в абонентському відділі.",
      "date": "2026-06-10",
      "category": "announcement"
    },
    {
      "id": 6,
      "title": "Відновлення роботи котельні №3 після капітального ремонту",
      "text": "Після завершення капітального ремонту котельні №3, що на вул. Гагаріна, її роботу повністю відновлено. Встановлено сучасне енергоефективне обладнання, що дозволить зменшити споживання газу на 15%.",
      "date": "2026-06-05",
      "category": "news"
    },
    {
      "id": 7,
      "title": "Аварійне відключення теплопостачання — вул. Коновальця",
      "text": "У зв'язку з поривом тепломережі тимчасово припинено гаряче водопостачання на вул. Коновальця, буд. 10-18. Аварійна бригада працює на місці. Орієнтовний час відновлення — 20:00.",
      "date": "2026-06-18",
      "category": "shutdown"
    },
    {
      "id": 8,
      "title": "Графік покосу трави на прибудинкових територіях",
      "text": "Затверджено графік покосу трави на червень-липень 2026 року. Роботи виконуватимуться згідно з районним графіком. Просимо мешканців не залишати автомобілі на газонах у дні проведення робіт.",
      "date": "2026-06-12",
      "category": "announcement"
    }
  ];
}

/**
 * Highlight active navigation link based on current page
 */
function highlightActiveNav() {
  var currentPath = window.location.pathname;
  var navLinks = document.querySelectorAll('.nav a');

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// ==================== CONTACT FORM HANDLER ====================
function handleFormSubmit(event) {
  if (event) event.preventDefault();

  var formMessage = document.getElementById('formMessage');
  var name = document.getElementById('name').value.trim();
  var email = document.getElementById('email').value.trim();
  var phone = document.getElementById('phone').value.trim();
  var topic = document.getElementById('topic').value;
  var message = document.getElementById('message').value.trim();

  // Validation
  if (!name || !email || !message) {
    showFormMessage('error', 'Будь ласка, заповніть усі обов\'язкові поля (ім\'я, email, повідомлення).');
    return;
  }

  if (!isValidEmail(email)) {
    showFormMessage('error', 'Будь ласка, введіть коректну email-адресу.');
    return;
  }

  // Simulate sending (in production, send to a real endpoint or use Formspree/Netlify Forms)
  // For demo purposes, show success message
  var formData = {
    name: name,
    email: email,
    phone: phone,
    topic: topic,
    message: message
  };

  console.log('Дані форми:', formData);

  // Show success
  showFormMessage('success', 'Дякуємо! Ваше повідомлення успішно надіслано. Ми зв\'яжемося з Вами найближчим часом.');

  // Reset form
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('topic').value = '';
  document.getElementById('message').value = '';

  // Hide success message after 5 seconds
  setTimeout(function () {
    if (formMessage) {
      formMessage.className = 'form-message';
    }
  }, 5000);
}

/**
 * Show form message (success or error)
 */
function showFormMessage(type, text) {
  var formMessage = document.getElementById('formMessage');
  if (!formMessage) return;
  formMessage.className = 'form-message ' + type;
  formMessage.textContent = text;
}

/**
 * Simple email validation
 */
function isValidEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}