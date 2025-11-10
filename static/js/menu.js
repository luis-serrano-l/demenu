// Menu filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    
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
            
            // Scroll to category after filtering
            setTimeout(() => {
                if (category !== 'all') {
                    const targetCategory = document.querySelector(`.menu-category[data-category="${category}"]:not(.hidden)`);
                    if (targetCategory) {
                        const isMobile = window.innerWidth <= 768;
                        const offset = isMobile ? 20 : 100;
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
                        const offset = window.innerWidth <= 768 ? 20 : 100;
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
});
