// Menu filtering functionality
document.addEventListener('DOMContentLoaded', function() {
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
});
