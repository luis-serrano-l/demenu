// Menu filtering functionality and hash-based routing
document.addEventListener('DOMContentLoaded', function() {
    // Check for hash in URL (path-based: /menu/{hash} or query: ?hash=abc123)
    function getHashFromURL() {
        // Check query parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParam = urlParams.get('hash');
        if (hashParam) {
            return hashParam;
        }
        
        // Check for /menu/{hash} pattern (primary format)
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const menuIndex = pathParts.indexOf('menu');
        if (menuIndex !== -1 && pathParts.length > menuIndex + 1) {
            const hash = pathParts[menuIndex + 1];
            // Validate it looks like a hash (base64-like, typically 16+ chars)
            if (hash.length >= 16 && /^[A-Za-z0-9+/=_-]+$/.test(hash)) {
                return hash;
            }
        }
        
        return null;
    }
    
    const hash = getHashFromURL();
    const botApiUrl = window.BOT_API_URL || ''; // Configurable via Hugo config
    
    // If hash is present, fetch data from bot API
    if (hash) {
        const menuStatic = document.getElementById('menu-static');
        const menuDynamic = document.getElementById('menu-dynamic');
        const menuLoading = document.getElementById('menu-loading');
        const menuError = document.getElementById('menu-error');
        
        // Hide static menu, show loading
        if (menuStatic) menuStatic.style.display = 'none';
        if (menuLoading) menuLoading.style.display = 'block';
        if (menuError) menuError.style.display = 'none';
        
        if (!botApiUrl) {
            // Bot API URL not configured
            if (menuLoading) menuLoading.style.display = 'none';
            if (menuError) {
                menuError.style.display = 'block';
                menuError.innerHTML = '<p><strong>Error:</strong> Bot API URL not configured.</p><p>Please configure <code>botApiUrl</code> in your Hugo config file.</p>';
            }
            return;
        }
        
        const menuUrl = `${botApiUrl}/api/user/${hash}/menu.json`;
        
        // Log to console for debugging (not exposed to users)
        console.log('Fetching menu data...');
        
        // Add timeout to fetch (3 seconds for faster feedback)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('Request timeout - aborting fetch');
            controller.abort();
        }, 3000); // 3 second timeout
        
        fetch(menuUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors'
        })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    // Don't expose HTTP status details to users
                    if (response.status === 404) {
                        throw new Error('NOT_FOUND');
                    }
                    throw new Error('SERVER_ERROR');
                }
                return response.json();
            })
            .then(data => {
                console.log('Menu loaded successfully');
                if (menuLoading) menuLoading.style.display = 'none';
                if (menuError) menuError.style.display = 'none';
                
                // Render menu dynamically
                renderDynamicMenu(data, menuDynamic);
                
                // Initialize filtering after menu is rendered
                setTimeout(initializeMenuFiltering, 100);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                // Log error details to console for debugging (not exposed to users)
                console.error('Error loading menu:', error);
                if (menuLoading) menuLoading.style.display = 'none';
                if (menuError) {
                    menuError.style.display = 'block';
                    let errorMsg = 'Unable to load menu. Please check your link and try again.';
                    if (error.name === 'AbortError') {
                        errorMsg = 'Request timed out. Please try again.';
                    } else if (error.message === 'NOT_FOUND') {
                        errorMsg = 'Menu not found. Please check your link.';
                    } else if (error.message === 'SERVER_ERROR') {
                        errorMsg = 'Unable to load menu. Please try again later.';
                    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        errorMsg = 'Unable to connect. Please try again later.';
                    }
                    menuError.innerHTML = `<p><strong>Error loading menu:</strong> ${errorMsg}</p>`;
                }
            });
    } else {
        // No hash - use static menu (default menu at /menu)
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
