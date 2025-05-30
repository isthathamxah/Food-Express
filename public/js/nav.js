document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    let lastScroll = 0;

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Toggle mobile menu function
    function toggleMobileMenu(force = null) {
        const isOpen = force !== null ? force : !navLinks.classList.contains('active');
        
        navLinks.classList.toggle('active', isOpen);
        authButtons.classList.toggle('active', isOpen);
        
        // Toggle menu icon
        const icon = mobileMenuBtn.querySelector('i');
        if (isOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInside = e.target.closest('.header-container');
        if (!isClickInside && navLinks.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Close mobile menu when pressing escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                toggleMobileMenu(false);
            }
        }, 250);
    });

    // Handle scroll behavior
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolling down
        if (currentScroll > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header when scrolling down, show when scrolling up
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Set active nav link based on current page
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath === linkPath || 
                (currentPath === '/' && linkPath === 'index.html') ||
                (currentPath.includes(linkPath) && linkPath !== 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Initialize
    setActiveNavLink();
}); 