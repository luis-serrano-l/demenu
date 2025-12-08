// Menu filtering functionality and hash-based routing
document.addEventListener('DOMContentLoaded', function() {
    // Check for hash in URL (path-based: /hash or /menu/hash or query: ?hash=abc123)
    function getHashFromURL() {
        // Check query parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParam = urlParams.get('hash');
        if (hashParam) {
            return hashParam;
        }
        
        // Check path segments
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const knownRoutes = ['menu', 'meals', 'categories', 'tags', 'index.html', 'index'];
        
        // Check each path part to find a hash
        // Hash typically looks like base64 (contains =, A-Z, a-z, 0-9, +, /, -)
        // and is typically 16+ characters
        for (let i = pathParts.length - 1; i >= 0; i--) {
            const part = pathParts[i];
            // Check if it looks like a hash (base64-like, typically 16+ chars and may contain =)
            if (part.length >= 16 && /^[A-Za-z0-9+/=_-]+$/.test(part)) {
                // If it's not a known route, treat it as a hash
                if (!knownRoutes.includes(part.toLowerCase())) {
                    return part;
                }
            }
        }
        
        // Fallback: check for /menu/hash pattern
        const menuIndex = pathParts.indexOf('menu');
        if (menuIndex !== -1 && pathParts.length > menuIndex + 1) {
            return pathParts[menuIndex + 1];
        }
        
        return null;
    }
    
    const hash = getHashFromURL();
    const botApiUrl = window.BOT_API_URL || 'http://localhost:8080'; // Configurable via global variable
    
    // If hash is present, fetch data from bot API
    if (hash) {
        const menuStatic = document.getElementById('menu-static');
        const menuDynamic = document.getElementById('menu-dynamic');
        const menuLoading = document.getElementById('menu-loading');
        const menuError = document.getElementById('menu-error');
        
        if (menuStatic) menuStatic.style.display = 'none';
        if (menuLoading) menuLoading.style.display = 'block';
        
        const menuUrl = `${botApiUrl}/api/user/${hash}/menu.json`;
        
        fetch(menuUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load menu');
                }
                return response.json();
            })
            .then(data => {
                if (menuLoading) menuLoading.style.display = 'none';
                if (menuError) menuError.style.display = 'none';
                
                // Render menu dynamically
                renderDynamicMenu(data, menuDynamic);
                
                // Initialize filtering after menu is rendered
                setTimeout(initializeMenuFiltering, 100);
            })
            .catch(error => {
                console.error('Error loading menu:', error);
                if (menuLoading) menuLoading.style.display = 'none';
                if (menuError) menuError.style.display = 'block';
            });
    } else {
        // Use static menu, initialize filtering normally
        initializeMenuFiltering();
    }
    
    function renderDynamicMenu(data, container) {
        if (!container) return;
        
        if (!data.categories || data.categories.length === 0) {
            container.innerHTML = '<p>No menu data available.</p>';
            container.style.display = 'block';
            return;
        }
        
        // Build menu HTML (same structure as static menu)
        let html = '<div class="menu-container">';
        
        // Sidebar with filters
        html += '<button class="sidebar-toggle sidebar-toggle-external" aria-label="Toggle categories"><span class="toggle-icon">☰</span></button>';
        html += '<div class="sidebar-overlay"></div>';
        html += '<div class="menu-sidebar">';
        html += '<div class="sidebar-header">';
        html += '<button class="sidebar-toggle sidebar-toggle-internal" aria-label="Toggle categories"><span class="toggle-icon">☰</span></button>';
        html += '<button class="sidebar-close" aria-label="Close sidebar">×</button>';
        html += '</div>';
        html += '<div class="menu-filters">';
        html += '<button class="filter-btn active" data-category="all">All</button>';
        
        data.categories.forEach(category => {
            html += `<button class="filter-btn" data-category="${escapeHtml(category.id)}">${escapeHtml(category.name)}</button>`;
        });
        
        html += '</div></div>';
        
        // Menu content
        html += '<div class="menu-content"><div class="menu-categories">';
        
        data.categories.forEach(category => {
            html += `<section class="menu-category" data-category="${escapeHtml(category.id)}">`;
            html += `<h2 class="category-title">${escapeHtml(category.name)}</h2>`;
            if (category.description) {
                html += `<p class="category-description">${escapeHtml(category.description)}</p>`;
            }
            html += '<div class="menu-items">';
            
            category.items.forEach(item => {
                html += '<div class="menu-item">';
                html += `<h3 class="item-name">${escapeHtml(item.name)}</h3>`;
                if (item.description) {
                    html += `<p class="item-description">${escapeHtml(item.description)}</p>`;
                }
                html += `<span class="item-price">$${parseFloat(item.price).toFixed(2)}</span>`;
                html += '</div>';
            });
            
            html += '</div></section>';
        });
        
        html += '</div></div></div>';
        
        container.innerHTML = html;
        container.style.display = 'block';
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function initializeMenuFiltering() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const menuCategories = document.querySelectorAll('.menu-category');
        const sidebar = document.querySelector('.menu-sidebar');
        const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
        const sidebarClose = document.querySelector('.sidebar-close');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Toggle sidebar on mobile
    function openSidebar() {
        if (sidebar && isMobile()) {
            sidebar.classList.add('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }
    
    function toggleSidebar() {
        if (sidebar && isMobile()) {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
    }
    
    sidebarToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleSidebar);
    });
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking a filter button on mobile
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter categories
            menuCategories.forEach(categorySection => {
                if (category === 'all') {
                    categorySection.classList.remove('hidden');
                } else {
                    const categoryId = categorySection.getAttribute('data-category');
                    if (categoryId === category) {
                        categorySection.classList.remove('hidden');
                    } else {
                        categorySection.classList.add('hidden');
                    }
                }
            });
            
            // Close sidebar on mobile after selecting a category
            if (isMobile()) {
                closeSidebar();
            }
            
            // Scroll to category after filtering
            setTimeout(() => {
                if (category !== 'all') {
                    const targetCategory = document.querySelector(`.menu-category[data-category="${category}"]:not(.hidden)`);
                    if (targetCategory) {
                        const offset = isMobile() ? 20 : 100;
                        const categoryTop = targetCategory.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({
                            top: categoryTop - offset,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    const menuContent = document.querySelector('.menu-content');
                    if (menuContent) {
                        const menuContentTop = menuContent.getBoundingClientRect().top + window.pageYOffset;
                        const offset = isMobile() ? 20 : 100;
                        window.scrollTo({
                            top: menuContentTop - offset,
                            behavior: 'smooth'
                        });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            }, 50);
        });
    });
    
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        });
    }
});
