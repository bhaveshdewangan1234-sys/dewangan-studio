/**
 * Dewangan Photo & Videography - Studio Suite
 * Core State, Database Sync, Auth, Public Website Forms, Reports, and Signature Pad Script
 */

document.addEventListener('DOMContentLoaded', () => {
    try {

    window.onerror = function(message, source, lineno, colno, error) {
        if (message === 'Script error.' || !source || (lineno === 0 && colno === 0)) {
            return false; // Ignore generic cross-origin or extension errors
        }
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.background = '#ef4444';
        errorDiv.style.color = '#ffffff';
        errorDiv.style.padding = '10px';
        errorDiv.style.zIndex = '999999';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.style.fontSize = '12px';
        errorDiv.innerHTML = '<strong>JS Error:</strong> ' + message + ' at ' + source + ':' + lineno + ':' + colno;
        document.body.appendChild(errorDiv);
        return false;
    };

    const isAdminPage = document.getElementById('admin-portal') !== null;

    // =========================================================================
    // 1. APPLICATION STATE & DEFAULT DATABASE
    // =========================================================================
    
    let appState = {
        dbType: 'demo', // 'cloud' or 'demo'
        firebaseConfig: null,
        currentUser: null,
        
        // Data arrays
        customers: [],
        invoices: [],
        quotations: [], // Holds all Bookings & Quotations (Quotation, Booking, Completed)
        enquiries: [],  // Public enquiry form submissions
        services: [],
        gallery: [],    // New portfolio gallery state
        blog: [],       // New blog articles state
        categories: [], // New category filters state
        mediaItems: [], // New social media manager state
        settings: {
            studioName: "Dewangan Photo & Videography",
            studioPhone: "9301614549",
            studioEmail: "bhaveshdewangan1234@gmail.com",
            studioWebsite: "www.dewanganphotoandvideography.com",
            studioAddress: "Ward No. 16, beside IPS School, Shivpuri, Jamul, Bhilai, Chhattisgarh 490024",
            invoiceTerms: "1. 50% advance payment required at the time of booking.\n2. Remaining balance must be paid immediately on shoot completion.\n3. Raw images will be shared within 48 hours; edited photos will take 15-30 days.\n4. Delivery timelines are subject to change based on modifications.",
            upiId: "9301614549@ybl",
            payeeName: "Dewangan Photo & Videography",
            adminPassword: "admin123",
            logoUrl: "",
            alternateEmail: "bhaveshdewangan1234@gmail.com",
            alternatePhone: "9301614549",
            currency: "INR",
            faviconUrl: "",
            slide1Url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
            slide2Url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80",
            slide3Url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1920&q=80",
            aboutTitle: "Dewangan Photo & Videography",
            aboutDescHtml: `<h3><strong>Best Photo &amp; Videography in Shivpuri</strong></h3><p>Best Photo &amp; Videography in Shivpuri, If you are looking for the <strong>best photo and videography in Shivpuri</strong>, you've come to the right place. Our team offers a wide range of professional photography and videography services, including wedding shoots, engagement sessions, maternity photoshoots, birthday parties, corporate events, and more. Every frame we capture tells a unique story &mdash; your story &mdash; filled with emotions, colors, and memories that last a lifetime. Our goal is to make you relive your special moments every time you look at your photographs or videos. We combine traditional and modern styles to deliver cinematic visuals that are vibrant, natural, and timeless. Whether it's an intimate celebration or a grand destination wedding, we ensure every detail is beautifully captured with precision and passion.</p>`,
            aboutImageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
            weddingCoverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            preweddingCoverUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
            engagementCoverUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
            birthdayCoverUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
            maternityCoverUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
            babyCoverUrl: "https://images.unsplash.com/photo-1504194184404-4aa24119721b?auto=format&fit=crop&w=800&q=80",
            videographyCoverUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
            droneCoverUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
            albumCoverUrl: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&w=800&q=80"
        }
    };

    // Predefined baseline photoshoot services
    const defaultServices = [
        { id: 'srv_1', name: 'Wedding Photography', basePrice: 25000, icon: 'fa-camera', enabled: true },
        { id: 'srv_2', name: 'Wedding Videography', basePrice: 30000, icon: 'fa-video', enabled: true },
        { id: 'srv_3', name: 'Pre-Wedding Shoot', basePrice: 15000, icon: 'fa-photo-film', enabled: true },
        { id: 'srv_4', name: 'Engagement Shoot', basePrice: 10000, icon: 'fa-heart', enabled: true },
        { id: 'srv_5', name: 'Birthday Photography', basePrice: 5000, icon: 'fa-champagne-glasses', enabled: true },
        { id: 'srv_6', name: 'Anniversary Shoot', basePrice: 6000, icon: 'fa-champagne-glasses', enabled: true },
        { id: 'srv_7', name: 'Maternity Shoot', basePrice: 8000, icon: 'fa-child-rehearsal', enabled: true },
        { id: 'srv_8', name: 'Baby Shoot', basePrice: 7000, icon: 'fa-child-rehearsal', enabled: true },
        { id: 'srv_9', name: 'Drone Photography addon', basePrice: 10000, icon: 'fa-circle-play', enabled: true },
        { id: 'srv_10', name: 'Drone Videography addon', basePrice: 12000, icon: 'fa-circle-play', enabled: true },
        { id: 'srv_11', name: 'Wedding Album Design & Print', basePrice: 8000, icon: 'fa-image', enabled: true }
    ];

    // High fidelity Mock Data for offline Demo mode
    const mockCustomers = [
        { id: 'cust_1', name: 'Aakash Dewangan', mobile: '9301614549', email: 'aakash@gmail.com', address: 'Shivpuri, Jamul, Durg' },
        { id: 'cust_2', name: 'Priya Sharma', mobile: '9876543210', email: 'priya.sharma@yahoo.com', address: 'Sadar Bazar, Raipur' },
        { id: 'cust_3', name: 'Rohan Patel', mobile: '8877665544', email: 'rohan.patel@outlook.com', address: 'Civic Center, Bhilai' }
    ];

    const mockEnquiries = [
        {
            id: 'enq_1',
            name: 'Ramesh Kumar',
            mobile: '9876543210',
            email: 'ramesh.kumar@gmail.com',
            eventType: 'Wedding Photography',
            eventDate: '2026-08-12',
            eventLocation: 'Chawla Lawns, Raipur',
            message: 'Need full-day candid captures + custom physical album printing.',
            dateSent: new Date('2026-07-19T14:30:00').toISOString(),
            status: 'Pending'
        },
        {
            id: 'enq_2',
            name: 'Suman Patel',
            mobile: '8877665544',
            email: 'suman.patel@yahoo.com',
            eventType: 'Pre-Wedding Shoot',
            eventDate: '2026-09-05',
            eventLocation: 'Maitri Bagh, Bhilai',
            message: 'Looking for a cinematic sunset pre-wedding video shoot.',
            dateSent: new Date('2026-07-20T10:15:00').toISOString(),
            status: 'Pending'
        }
    ];

    const mockQuotations = [
        {
            id: 'qt_1',
            type: 'Quotation',
            number: 'QT-2026-0001',
            customerId: 'cust_2',
            customerDetails: mockCustomers[1],
            date: '2026-07-15',
            eventDate: '2026-08-20',
            eventLocation: 'Hotel Hyatt, Raipur',
            items: [
                { serviceId: 'srv_3', name: 'Pre-Wedding Shoot', rate: 15000, qty: 1, total: 15000 },
                { serviceId: 'srv_11', name: 'Wedding Album Design & Print', rate: 8000, qty: 1, total: 8000 }
            ],
            subtotal: 23000,
            extraCharges: 1000,
            discountPercent: 10,
            discountVal: 2300,
            taxPercent: 5,
            taxVal: 1085,
            grandTotal: 22785,
            status: 'Pending',
            selectionStatus: 'Not Started',
            termsAccepted: false,
            createdDate: new Date('2026-07-15T10:30:00').toISOString()
        },
        {
            id: 'qt_2',
            type: 'Booking',
            number: 'BK-2026-0001',
            customerId: 'cust_1',
            customerDetails: mockCustomers[0],
            date: '2026-07-10',
            eventDate: '2026-07-28', // Upcoming Event
            eventLocation: 'Jamul Palace Hall',
            items: [
                { serviceId: 'srv_1', name: 'Wedding Photography', rate: 25000, qty: 1, total: 25000 },
                { serviceId: 'srv_2', name: 'Wedding Videography', rate: 30000, qty: 1, total: 30000 }
            ],
            subtotal: 55000,
            extraCharges: 3000,
            discountPercent: 5,
            discountVal: 2750,
            taxPercent: 0,
            taxVal: 0,
            grandTotal: 55250,
            status: 'Confirmed',
            selectionStatus: 'Selection Pending',
            termsAccepted: true,
            signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            acceptanceDate: new Date('2026-07-10T15:20:00').toISOString(),
            createdDate: new Date('2026-07-10T14:45:00').toISOString()
        }
    ];

    const mockInvoices = [
        {
            id: 'inv_1',
            number: 'INV-2026-0001',
            bookingId: 'qt_2',
            customerId: 'cust_1',
            customerDetails: mockCustomers[0],
            date: '2026-07-10',
            items: [
                { serviceId: 'srv_1', name: 'Wedding Photography', rate: 25000, qty: 1, total: 25000 },
                { serviceId: 'srv_2', name: 'Wedding Videography', rate: 30000, qty: 1, total: 30000 }
            ],
            subtotal: 55000,
            extraCharges: 3000,
            discountPercent: 5,
            discountVal: 2750,
            taxPercent: 0,
            taxVal: 0,
            grandTotal: 55250,
            paymentStatus: 'Partial',
            paidAmount: 30000,
            balanceDue: 25250,
            paymentMode: 'UPI',
            termsAccepted: true,
            signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            acceptanceDate: new Date('2026-07-10T15:20:00').toISOString(),
            createdDate: new Date('2026-07-10T14:45:00').toISOString()
        }
    ];

    // Mock Categories portfolio items
    const defaultCategories = [
        { id: 'wedding', title: 'Wedding Shoot', desc: 'Premium royal wedding ceremonies and bridal cover photography.', imgUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=150&q=80', createdAt: '2025-10-13 06:24:35' },
        { id: 'prewedding', title: 'Pre Wedding Shoot', desc: 'Cinematic pre-wedding music videos and romantic couple captures.', imgUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=150&q=80', createdAt: '2025-10-13 06:35:22' },
        { id: 'engagement', title: 'Engagement Shoot', desc: 'Elegant portrait sessions and ring exchange captures.', imgUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=150&q=80', createdAt: '2025-10-13 06:44:54' },
        { id: 'birthday', title: 'Candid Shoot', desc: 'Candid event coverage, birthday celebrations, and celebrations.', imgUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=150&q=80', createdAt: '2025-10-13 06:54:05' },
        { id: 'maternity', title: 'Maternity Shoot', desc: 'Sanitized safe indoor/outdoor baby shower and maternity cover shoots.', imgUrl: 'https://images.unsplash.com/photo-1504194184404-4aa24119721b?auto=format&fit=crop&w=150&q=80', createdAt: '2025-10-13 06:56:44' }
    ];

    // Mock Gallery portfolio items
    const defaultGallery = [
        { id: 'gal_1', title: 'Royal Wedding Entry', category: 'wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', desc: 'Sabyasachi themed captures' },
        { id: 'gal_2', title: 'Cinematic Garland Exchange', category: 'wedding', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', desc: 'Slow motion framing' },
        { id: 'gal_3', title: 'Sunset Silhouette Couple', category: 'prewedding', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80', desc: 'Golden golden hour reflection' },
        { id: 'gal_4', title: 'Romantic Lakeside Walk', category: 'prewedding', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80', desc: 'Concept narrative' },
        { id: 'gal_5', title: 'Sparkling Ring Exchange', category: 'engagement', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', desc: 'Macro close-up details' },
        { id: 'gal_6', title: 'Cute Infant Themed Setup', category: 'maternity', url: 'https://images.unsplash.com/photo-1504194184404-4aa24119721b?auto=format&fit=crop&w=800&q=80', desc: 'Sanitized safe indoor set' }
    ];

    // Default Social Media streaming items (YouTube & Instagram)
    const defaultMediaItems = [
        { id: 'med_1', type: 'youtube', title: 'Grand Royal Rajput Wedding Ceremony Chhattisgarh', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U', enabled: true, createdAt: '2026-07-26 18:00:00' },
        { id: 'med_2', type: 'instagram', title: 'Cinematic Bridal Smile Portrait Shoot Reel', url: 'https://www.instagram.com/reel/C8rM9O_x9yF/', embedUrl: 'https://www.instagram.com/reel/C8rM9O_x9yF/embed/', enabled: true, createdAt: '2026-07-26 18:15:00' }
    ];

    // Mock Blog Articles
    const defaultBlog = [
        {
            id: 'blog_1',
            title: 'Top 5 Wedding Photoshoot Themes in Raipur',
            excerpt: 'Raipur offers majestic lawns, heritage hotels, and vintage backdrops. Read our recommendations to make your day royal.',
            content: 'Raipur, the capital of Chhattisgarh, has emerged as a premium hub for luxury wedding destinations. From the elegant setups at Hotel Hyatt and Sayaji to royal lawns, wedding couples have endless opportunities to capture cinematic stories. In this guide, we review the top 5 photoshoot themes:\n\n1. Sabyasachi Royal Traditionalism: Loaded with deep red vermillion tones, brushed golds, and warm candles.\n2. Modern Glassmorphism Candid: Chic, clean lighting, transparent stage outlines, and pastel colors.\n3. Sunset Silhouette & Drone Sweeps: Utilizing the open skies and dual operator drones.\n4. Vintage Black & White Candid Portrait sets.\n5. Cultural Haldi/Sangeet Vibrant Color Pop themes.',
            author: 'Creative Director',
            date: '2026-07-20',
            cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'blog_2',
            title: 'How to Prepare for Your Pre-Wedding Photoshoot',
            excerpt: 'Everything you need to know about costume coordination, timing choice, and safe poses for pre-wedding sweeps.',
            content: 'Pre-wedding shoots are the perfect opportunity for couples to get comfortable in front of cinematic cameras. To ensure your sunset sweeps are flawless, consider the following checklist:\n\n- Dress Coordination: Wear contrasting solid colors. Avoid busy patterns.\n- Golden Hour Timing: The best lighting is 30 minutes before and after sunrise or sunset. Plan schedules accordingly.\n- Costumes: Carry 2 to 3 sets of clothing representing different vibes (Traditional, Casual, Formal).\n- Props Selection: Sparklers, smoke bombs, and vintage cars add production value.',
            author: 'Studio Director',
            date: '2026-07-22',
            cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'blog_3',
            title: 'Why Choose Physical Layflat Wedding Albums?',
            excerpt: 'Digital images are beautiful, but a printed matte album holds history. Understand the layflat luxury paper design.',
            content: 'While USB drives and cloud folders are excellent for sharing, a premium physically printed wedding album is an heirloom. Layflat binding is the gold standard for high-end wedding albums. Let’s look at the benefits:\n\n1. No Image Loss: Unlike traditional books, layflat pages open 100% flat with zero gutters. Seamless panoramic printing.\n2. Luxury Textures: Matte waterproof coatings protect inks from humidity.\n3. Durability: Built with heavy board pages that do not wrinkle over time.\n4. Gift Boxing: Comes wrapped in velvet inside structured leather cases.',
            author: 'Lead Album Designer',
            date: '2026-07-25',
            cover: 'https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&w=800&q=80'
        }
    ];

    // =========================================================================
    // 2. DOM ELEMENTS
    // =========================================================================
    
    // Auth & Layout Containers
    const publicSite = document.getElementById('public-site');
    const adminPortal = document.getElementById('admin-portal');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const loginOverlay = document.getElementById('login-overlay');
    
    // Forms
    const onboardingForm = document.getElementById('onboarding-form');
    const firebaseConfigInput = document.getElementById('firebase-config-input');
    const skipOnboardingBtn = document.getElementById('skip-onboarding-btn');
    
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const toggleLoginPassBtn = document.getElementById('toggle-login-pass');
    const logoutBtn = document.getElementById('logout-btn');
    const userDisplayName = document.getElementById('user-display-name');
    const cancelLoginBtn = document.getElementById('cancel-login-btn');

    // Public Site Elements
    const publicLinks = document.querySelectorAll('.pub-link');
    const publicSections = document.querySelectorAll('.public-section');
    const adminLoginTrigger = document.getElementById('admin-login-trigger');
    const footerAdminLoginLink = document.getElementById('footer-admin-login-link');
    const publicEnquiryForm = document.getElementById('public-enquiry-form');
    const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');

    // Sidebar & Workspace
    const themeToggle = document.getElementById('theme-toggle');
    const sidebarStudioName = document.getElementById('sidebar-studio-name');
    const dbStatusBadge = document.getElementById('db-status-badge');
    const activeTabTitle = document.getElementById('active-tab-title');
    const activeTabDesc = document.getElementById('active-tab-desc');
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const sidebarEnqBadge = document.getElementById('sidebar-enq-badge');

    // Quick Action Triggers (Defensive queries)
    const quickBookingBtn = document.getElementById('quick-booking-btn');
    const quickInvoiceBtn = document.getElementById('quick-invoice-btn');

    // Dashboard Output KPIs (Redesigned)
    const dashEnquiries = document.getElementById('dash-enquiries');
    const dashEnquiriesPending = document.getElementById('dash-enquiries-pending');
    const dashPhotos = document.getElementById('dash-photos');
    const dashCategories = document.getElementById('dash-categories');
    const dashClients = document.getElementById('dash-clients');
    const recentCustomersTbody = document.getElementById('dash-recent-customers-tbody');
    const dashViewCustomersLink = document.getElementById('dash-view-customers-link');

    // Modals
    const customerModal = document.getElementById('customer-modal');
    const customerForm = document.getElementById('customer-form');
    const closeCustomerModalBtn = document.getElementById('close-customer-modal-btn');
    const cancelCustomerModalBtn = document.getElementById('cancel-customer-modal-btn');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    
    const serviceModal = document.getElementById('service-modal');
    const serviceForm = document.getElementById('service-form');
    const closeServiceModalBtn = document.getElementById('close-service-modal-btn');
    const cancelServiceModalBtn = document.getElementById('cancel-service-modal-btn');
    const addCustomServiceBtn = document.getElementById('add-custom-service-btn');

    // NEW: Gallery image modals & elements
    const adminGalleryModal = document.getElementById('admin-gallery-modal');
    const adminGalleryForm = document.getElementById('admin-gallery-form');
    const closeGalleryModalBtn = document.getElementById('close-gallery-modal-btn');
    const cancelGalleryModalBtn = document.getElementById('cancel-gallery-modal-btn');
    const adminAddGalleryBtn = document.getElementById('admin-add-gallery-btn');
    const adminGalleryGridContainer = document.getElementById('admin-gallery-grid-container');
    const publicGalleryGrid = document.getElementById('public-gallery-grid');

    // NEW: Blog modals & elements
    const adminBlogModal = document.getElementById('admin-blog-modal');
    const adminBlogForm = document.getElementById('admin-blog-form');
    const closeBlogModalBtn = document.getElementById('close-blog-modal-btn');
    const cancelBlogModalBtn = document.getElementById('cancel-blog-modal-btn');
    const adminAddBlogBtn = document.getElementById('admin-add-blog-btn');
    const adminBlogListTbody = document.getElementById('admin-blog-list-tbody');
    const publicBlogGrid = document.getElementById('public-blog-grid');
    const publicServicesGrid = document.getElementById('public-services-grid');
    
    const docModal = document.getElementById('doc-modal');
    const docForm = document.getElementById('doc-form');
    const closeDocModalBtn = document.getElementById('close-doc-modal-btn');
    const cancelDocModalBtn = document.getElementById('cancel-doc-modal-btn');
    const docTypeSelect = document.getElementById('doc-type-select');
    const docDateInput = document.getElementById('doc-date');
    const docEventDateInput = document.getElementById('doc-event-date');
    const docEventLocInput = document.getElementById('doc-event-loc');
    const docSelectionStatus = document.getElementById('doc-selection-status');
    const docEventDetailsInput = document.getElementById('doc-event-details');
    const docNumberInput = document.getElementById('doc-number-input');
    const docPaymentStatus = document.getElementById('doc-payment-status');
    const docPaymentMode = document.getElementById('doc-payment-mode');
    const docCustomerSelect = document.getElementById('doc-customer-select');
    const addItemRowBtn = document.getElementById('add-item-row-btn');
    const docItemsTbody = document.getElementById('doc-items-tbody');
    
    // Total Calculations in Wizard
    const wizSubtotal = document.getElementById('wiz-subtotal');
    const wizExtraCharges = document.getElementById('wiz-extra-charges');
    const wizExtraChargesVal = document.getElementById('wiz-extra-charges-val');
    const wizDiscountInput = document.getElementById('wiz-discount-input');
    const wizDiscountVal = document.getElementById('wiz-discount-val');
    const wizTaxInput = document.getElementById('wiz-tax-input');
    const wizTaxVal = document.getElementById('wiz-tax-val');
    const wizGrandTotal = document.getElementById('wiz-grand-total');
    const wizPaidAmountInput = document.getElementById('wiz-paid-amount-input');
    const wizBalanceVal = document.getElementById('wiz-balance-val');
    const wizardCustPreview = document.getElementById('wizard-cust-preview');
    const wizCustName = document.getElementById('wiz-cust-name');
    const wizCustPhone = document.getElementById('wiz-cust-phone');
    const wizCustAddress = document.getElementById('wiz-cust-address');
    const wizardQuickAddCust = document.getElementById('wizard-quick-add-cust');

    // A4 Document Preview
    const previewModal = document.getElementById('preview-modal');
    const closePreviewModalBtn = document.getElementById('close-preview-modal-btn');
    const previewSignBtn = document.getElementById('preview-sign-btn');
    const previewWhatsappBtn = document.getElementById('preview-whatsapp-btn');
    const previewPdfBtn = document.getElementById('preview-pdf-btn');
    const previewPrintBtn = document.getElementById('preview-print-btn');
    const a4ItemsTbody = document.getElementById('a4-items-tbody');
    const a4UpiQrImage = document.getElementById('a4-payment-qr-image');
    const invoiceThemeSelect = document.getElementById('invoice-theme-select');
    
    // T&C Signature Pad Modal elements
    const signModal = document.getElementById('sign-modal');
    const closeSignModalBtn = document.getElementById('close-sign-modal-btn');
    const cancelSignModalBtn = document.getElementById('cancel-sign-modal-btn');
    const signForm = document.getElementById('sign-form');
    const tcAgreeCheckbox = document.getElementById('tc-agree-checkbox');
    const signatureCanvas = document.getElementById('signature-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');

    // Tab lists
    const bookingsListTbody = document.getElementById('bookings-list-tbody');
    const invoicesListTbody = document.getElementById('invoices-list-tbody');
    const enquiriesListTbody = document.getElementById('enquiries-list-tbody');
    const customersGrid = document.getElementById('customers-grid');
    const servicesGrid = document.getElementById('services-grid');

    // Reports elements
    const repRangeSelect = document.getElementById('reports-range-select');
    const repMonthInput = document.getElementById('reports-month-input');
    const repDateInput = document.getElementById('reports-date-input');
    const repYearInput = document.getElementById('reports-year-input');
    const fetchReportBtn = document.getElementById('fetch-report-btn');
    const printReportBtn = document.getElementById('print-report-btn');
    const repTotalInvoiced = document.getElementById('rep-total-invoiced');
    const repTotalReceived = document.getElementById('rep-total-received');
    const repTotalBalance = document.getElementById('rep-total-balance');
    const repInvoicesCount = document.getElementById('rep-invoices-count');
    const reportsLedgerTbody = document.getElementById('reports-ledger-tbody');

    // Settings elements
    const settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
    const settingsSections = document.querySelectorAll('.settings-section');
    const studioProfileForm = document.getElementById('studio-profile-form');
    const studioPaymentForm = document.getElementById('studio-payment-form');
    const backupExportBtn = document.getElementById('backup-export-btn');
    const backupImportFile = document.getElementById('backup-import-file');
    const systemResetBtn = document.getElementById('system-reset-btn');
    const disconnectFbBtn = document.getElementById('disconnect-fb-btn');
    const updateFbConfigBtn = document.getElementById('update-fb-config-btn');
    const setFirebaseConfigJson = document.getElementById('set-firebase-config-json');

    // Toast
    const toastEl = document.getElementById('toast-notification');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    // Charts references
    let revenueChart = null;
    let servicesChart = null;
    let reportsChart = null;

    // Firebase instances
    let fbApp = null;
    let fbAuth = null;
    let fbStore = null;
    let unsubscribeFunctions = [];

    // Canvas drawing vars
    let isDrawing = false;
    let hasDrawn = false;
    const canvasContext = signatureCanvas ? signatureCanvas.getContext('2d') : null;

    // =========================================================================
    // 3. STORAGE & CONFIG INITIALIZATION
    // =========================================================================
    
    // Set active dates in creator
    const formatToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatCurrentMonth = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;
        return `${yyyy}-${mm}`;
    };

    // Client-side image compressor helper returning a Promise with compressed base64 jpeg
    const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.7, isLogo = false) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
                    
                    if (isPng && isLogo) {
                        try {
                            const imgData = ctx.getImageData(0, 0, width, height);
                            const data = imgData.data;
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i];
                                const g = data[i+1];
                                const b = data[i+2];
                                // Automatically key out black background pixels (R, G, B < 20)
                                if (r < 20 && g < 20 && b < 20) {
                                    data[i+3] = 0; // Set alpha to 0 (fully transparent)
                                }
                            }
                            ctx.putImageData(imgData, 0, 0);
                        } catch (err) {
                            console.error("Black removal filter failed:", err);
                        }
                    }

                    const dataUrl = isPng 
                        ? canvas.toDataURL('image/png') 
                        : canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Setup Drag-and-drop Portfolio Gallery Uploader
    const initGalleryUploader = () => {
        const dropzone = document.getElementById('gal-upload-dropzone');
        const fileInput = document.getElementById('gal-file-input');
        const content = document.getElementById('gal-dropzone-content');
        const preview = document.getElementById('gal-dropzone-preview');
        const previewImg = document.getElementById('gal-preview-img');
        const removeBtn = document.getElementById('gal-remove-preview-btn');
        const hiddenUrlInput = document.getElementById('gal-url');

        if (!dropzone || !fileInput) return;

        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('.remove-preview-btn')) return;
            fileInput.click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                handleSelectedFile(files[0]);
            }
        });

        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = '';
            hiddenUrlInput.value = '';
            previewImg.src = '';
            preview.classList.add('hidden');
            content.classList.remove('hidden');
        });

        const handleSelectedFile = (file) => {
            if (!file.type.startsWith('image/')) {
                showToast("Please select an image file.", "error");
                return;
            }
            showToast("Processing image... please wait.");
            compressImageFile(file)
                .then(base64Url => {
                    hiddenUrlInput.value = base64Url;
                    previewImg.src = base64Url;
                    content.classList.add('hidden');
                    preview.classList.remove('hidden');
                    showToast("Image loaded successfully!");
                })
                .catch(err => {
                    console.error(err);
                    showToast("Failed to process image.", "error");
                });
        };

        window.resetGalleryUploader = (existingUrl = '') => {
            fileInput.value = '';
            if (existingUrl) {
                hiddenUrlInput.value = existingUrl;
                previewImg.src = existingUrl;
                content.classList.add('hidden');
                preview.classList.remove('hidden');
            } else {
                hiddenUrlInput.value = '';
                previewImg.src = '';
                preview.classList.add('hidden');
                content.classList.remove('hidden');
            }
        };
    };

    // Setup settings upload helper buttons
    const initSettingsMediaUploaders = () => {
        const bindSettingUploader = (fileInputId, textInputId) => {
            const fileInput = document.getElementById(fileInputId);
            const textInput = document.getElementById(textInputId);
            if (!fileInput || !textInput) return;

            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (!file.type.startsWith('image/')) {
                        showToast("Please select an image file.", "error");
                        return;
                    }
                    showToast("Compressing and uploading image...");
                    compressImageFile(file)
                        .then(base64Url => {
                            textInput.value = base64Url;
                            showToast("Image loaded! Click 'Save Media Assets' to apply.");
                        })
                        .catch(err => {
                            console.error(err);
                            showToast("Failed to load image.", "error");
                        });
                }
            });
        };

        bindSettingUploader('upload-slide1-file', 'set-slide-1');
        bindSettingUploader('upload-slide2-file', 'set-slide-2');
        bindSettingUploader('upload-slide3-file', 'set-slide-3');
        bindSettingUploader('upload-about-file', 'set-about-image');
        bindSettingUploader('upload-wedding-file', 'set-wedding-cover');
        bindSettingUploader('upload-prewedding-file', 'set-prewedding-cover');
        bindSettingUploader('upload-engagement-file', 'set-engagement-cover');
        bindSettingUploader('upload-birthday-file', 'set-birthday-cover');
        bindSettingUploader('upload-maternity-file', 'set-maternity-cover');
        bindSettingUploader('upload-baby-file', 'set-baby-cover');
        bindSettingUploader('upload-videography-file', 'set-videography-cover');
        bindSettingUploader('upload-drone-file', 'set-drone-cover');
        bindSettingUploader('upload-album-file', 'set-album-cover');
    };

    // Load configurations
    const initApp = () => {
        // Theme init
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) themeToggle.checked = savedTheme === 'dark';

        // Check Firebase config in local storage
        const savedFirebaseConfig = localStorage.getItem('firebase_config');
        if (savedFirebaseConfig) {
            try {
                appState.firebaseConfig = JSON.parse(savedFirebaseConfig);
                appState.dbType = 'cloud';
                connectFirebase(appState.firebaseConfig);
            } catch (err) {
                console.error("Invalid Firebase Config saved:", err);
                localStorage.removeItem('firebase_config');
                appState.dbType = 'demo';
                initDemoMode();
            }
        } else {
            if (isAdminPage) {
                if (onboardingOverlay) onboardingOverlay.classList.remove('hidden');
            } else {
                appState.dbType = 'demo';
                initDemoMode();
            }
        }

        // Initialize Canvas event handlers
        initSignatureCanvas();
        
        // Setup Drag-and-drop Portfolio Gallery & Settings Uploaders
        initGalleryUploader();
        initCategoryUploader();
        initSettingsMediaUploaders();

        // Setup Public Portfolio Website links
        initPublicSite();
    };

    // Global function to show a specific public website section
    window.showPublicSection = (secId) => {
        const landingSectionIds = ['home', 'about', 'gallery', 'cinema', 'packages', 'why-choose', 'testimonials', 'contact'];
        const isLandingTarget = landingSectionIds.includes(secId);

        const publicSections = document.querySelectorAll('.public-section');
        
        if (isLandingTarget) {
            // Restore visibility for all main landing page sections
            publicSections.forEach(sec => {
                const sId = sec.id.replace('sec-', '');
                if (landingSectionIds.includes(sId)) {
                    sec.classList.remove('hidden');
                    sec.classList.add('active');
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('active');
                }
            });
            
            // Perform smooth scroll to target section container
            const targetSec = document.getElementById(`sec-${secId}`);
            if (targetSec) {
                setTimeout(() => {
                    targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
        } else {
            // Target is a specific sub-detail page. Hide landing sections, show only target.
            publicSections.forEach(sec => {
                if (sec.id === `sec-${secId}`) {
                    sec.classList.remove('hidden');
                    sec.classList.add('active');
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('active');
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Active link highlighting indicator updates
        const publicLinks = document.querySelectorAll('.pub-link');
        publicLinks.forEach(link => {
            if (link.getAttribute('data-sec') === secId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Setup Public portfolio navigations
    const initPublicSite = () => {
        // Initialize Hero Image Slider
        let currentHeroSlideIndex = 0;
        const heroSliderTitles = [
            "Creative Photo Graphy Agency",
            "Ultimate Wedding Photoshoot",
            "Cinematic Films & Drone Sweep"
        ];
        let heroSliderTimer = null;

        window.showHeroSlide = (index) => {
            const slides = document.querySelectorAll('#hero-slider .slide');
            if (slides.length === 0) return;

            if (index >= slides.length) {
                currentHeroSlideIndex = 0;
            } else if (index < 0) {
                currentHeroSlideIndex = slides.length - 1;
            } else {
                currentHeroSlideIndex = index;
            }

            slides.forEach((slide, i) => {
                if (i === currentHeroSlideIndex) {
                    slide.classList.remove('opacity-0');
                    slide.classList.add('opacity-100');
                } else {
                    slide.classList.remove('opacity-100');
                    slide.classList.add('opacity-0');
                }
            });

            const titleEl = document.getElementById('hero-slider-title');
            if (titleEl) {
                titleEl.textContent = heroSliderTitles[currentHeroSlideIndex];
            }
        };

        window.nextHeroSlide = () => {
            if (heroSliderTimer) clearInterval(heroSliderTimer);
            window.showHeroSlide(currentHeroSlideIndex + 1);
            heroSliderTimer = setInterval(() => {
                window.showHeroSlide(currentHeroSlideIndex + 1);
            }, 5000);
        };

        window.prevHeroSlide = () => {
            if (heroSliderTimer) clearInterval(heroSliderTimer);
            window.showHeroSlide(currentHeroSlideIndex - 1);
            heroSliderTimer = setInterval(() => {
                window.showHeroSlide(currentHeroSlideIndex + 1);
            }, 5000);
        };

        // Start autoplay
        heroSliderTimer = setInterval(() => {
            window.showHeroSlide(currentHeroSlideIndex + 1);
        }, 5000);

        publicLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const secId = link.getAttribute('data-sec');
                if (secId) {
                    e.preventDefault();
                    window.showPublicSection(secId);
                    // Collapse mobile menu if open
                    const mobMenu = document.getElementById('mobile-menu');
                    if (mobMenu) mobMenu.classList.add('hidden');
                }
            });
        });

        // Mobile Hamburger menu toggle
        const mobToggle = document.getElementById('mobile-nav-toggle');
        if (mobToggle) {
            mobToggle.addEventListener('click', () => {
                document.getElementById('mobile-menu').classList.toggle('hidden');
            });
        }

        // Trigger Login Modal overlays
        const openLogin = () => {
            loginOverlay.classList.remove('hidden');
            loginEmail.focus();
        };
        if (adminLoginTrigger) adminLoginTrigger.addEventListener('click', openLogin);
        if (footerAdminLoginLink) footerAdminLoginLink.addEventListener('click', openLogin);

        if (cancelLoginBtn) {
            cancelLoginBtn.addEventListener('click', () => {
                if (loginOverlay) loginOverlay.classList.add('hidden');
            });
        }

        const sidebarViewSiteItem = document.getElementById('sidebar-view-site-item');
        if (sidebarViewSiteItem) {
            sidebarViewSiteItem.addEventListener('click', (e) => {
                e.preventDefault();
                showPublicSite();
            });
        }

        // Initial public media grid rendering
        renderPublicMedia();
    };

    // Connect Firebase SDK
    const connectFirebase = (config) => {
        try {
            if (firebase.apps.length === 0) {
                fbApp = firebase.initializeApp(config);
            } else {
                fbApp = firebase.app();
            }
            fbAuth = firebase.auth();
            fbStore = firebase.firestore();

            // Set UI values
            if (dbStatusBadge) {
                dbStatusBadge.className = 'db-badge cloud';
                const txt = dbStatusBadge.querySelector('.badge-text');
                if (txt) txt.textContent = 'Cloud Database';
            }
            const statusTitle = document.getElementById('settings-fb-status-title');
            if (statusTitle) statusTitle.textContent = 'Firebase Status: Connected';
            const projId = document.getElementById('settings-fb-project-id');
            if (projId) projId.textContent = config.projectId;
            if (setFirebaseConfigJson) setFirebaseConfigJson.value = JSON.stringify(config, null, 2);

            // Listen to auth state
            fbAuth.onAuthStateChanged(user => {
                if (user) {
                    appState.currentUser = user;
                    if (userDisplayName) userDisplayName.textContent = user.email.split('@')[0];
                    hideAuthOverlays();
                    if (isAdminPage) {
                        showAdminPortal();
                        setupFirebaseListeners();
                    } else {
                        setupPublicFirebaseListeners();
                        renderPublicContent();
                    }
                } else {
                    appState.currentUser = null;
                    if (isAdminPage) {
                        if (loginOverlay) loginOverlay.classList.remove('hidden');
                        if (adminPortal) adminPortal.classList.add('hidden');
                        if (cancelLoginBtn) cancelLoginBtn.style.display = 'none';
                    } else {
                        setupPublicFirebaseListeners();
                        showPublicSite();
                    }
                }
            });
        } catch (err) {
            console.error("Firebase connection error:", err);
            showToast("Failed to connect to Firebase. Switching to Demo.", "error");
            appState.dbType = 'demo';
            initDemoMode();
        }
    };

    // Initialize Local Database Demo Mode
    const initDemoMode = () => {
        if (dbStatusBadge) {
            dbStatusBadge.className = 'db-badge demo';
            const badgeTxt = dbStatusBadge.querySelector('.badge-text');
            if (badgeTxt) badgeTxt.textContent = 'Local Demo Mode';
        }
        const statusTitle = document.getElementById('settings-fb-status-title');
        if (statusTitle) statusTitle.textContent = 'Firebase Status: Disconnected';
        const projId = document.getElementById('settings-fb-project-id');
        if (projId) projId.textContent = 'N/A';
        if (setFirebaseConfigJson) setFirebaseConfigJson.value = '';

        // Load Settings
        const localSettings = localStorage.getItem('studio_settings');
        if (localSettings) {
            appState.settings = JSON.parse(localSettings);
            let migrated = false;
            if (appState.settings.studioAddress === 'Balod, Chhattisgarh, India' || !appState.settings.studioAddress) {
                appState.settings.studioAddress = 'Ward No. 16, beside IPS School, Shivpuri, Jamul, Bhilai, Chhattisgarh 490024';
                migrated = true;
            }
            if (appState.settings.studioEmail === 'dewanganstudio@gmail.com') {
                appState.settings.studioEmail = 'bhaveshdewangan1234@gmail.com';
                migrated = true;
            }
            if (appState.settings.studioWebsite === 'www.dewanganstudio.com') {
                appState.settings.studioWebsite = 'www.dewanganphotoandvideography.com';
                migrated = true;
            }
            if (!appState.settings.slide1Url) {
                appState.settings.slide1Url = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80";
                migrated = true;
            }
            if (!appState.settings.slide2Url) {
                appState.settings.slide2Url = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80";
                migrated = true;
            }
            if (!appState.settings.slide3Url) {
                appState.settings.slide3Url = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1920&q=80";
                migrated = true;
            }
            if (!appState.settings.aboutTitle) {
                appState.settings.aboutTitle = "Dewangan Photo & Videography";
                migrated = true;
            }
            if (!appState.settings.aboutDescHtml) {
                appState.settings.aboutDescHtml = `<h3><strong>Best Photo &amp; Videography in Shivpuri</strong></h3><p>Best Photo &amp; Videography in Shivpuri, If you are looking for the <strong>best photo and videography in Shivpuri</strong>, you've come to the right place. Our team offers a wide range of professional photography and videography services, including wedding shoots, engagement sessions, maternity photoshoots, birthday parties, corporate events, and more. Every frame we capture tells a unique story &mdash; your story &mdash; filled with emotions, colors, and memories that last a lifetime. Our goal is to make you relive your special moments every time you look at your photographs or videos. We combine traditional and modern styles to deliver cinematic visuals that are vibrant, natural, and timeless. Whether it's an intimate celebration or a grand destination wedding, we ensure every detail is beautifully captured with precision and passion.</p>`;
                migrated = true;
            }

            if (appState.settings.alternateEmail === undefined) {
                appState.settings.alternateEmail = "bhaveshdewangan1234@gmail.com";
                migrated = true;
            }
            if (appState.settings.alternatePhone === undefined) {
                appState.settings.alternatePhone = "9301614549";
                migrated = true;
            }
            if (appState.settings.currency === undefined) {
                appState.settings.currency = "INR";
                migrated = true;
            }
            if (appState.settings.faviconUrl === undefined) {
                appState.settings.faviconUrl = "";
                migrated = true;
            }
            if (migrated) {
                localStorage.setItem('studio_settings', JSON.stringify(appState.settings));
            }
        } else {
            localStorage.setItem('studio_settings', JSON.stringify(appState.settings));
        }

        applyStudioSettingsUI();

        // Load Customers
        const localCustomers = localStorage.getItem('demo_customers');
        if (localCustomers) {
            appState.customers = JSON.parse(localCustomers);
        } else {
            appState.customers = mockCustomers;
            localStorage.setItem('demo_customers', JSON.stringify(mockCustomers));
        }

        // Load Services
        const localServices = localStorage.getItem('demo_services');
        if (localServices) {
            appState.services = JSON.parse(localServices);
        } else {
            appState.services = defaultServices;
            localStorage.setItem('demo_services', JSON.stringify(defaultServices));
        }

        // Load Gallery
        const localGallery = localStorage.getItem('demo_gallery');
        if (localGallery) {
            appState.gallery = JSON.parse(localGallery);
        } else {
            appState.gallery = defaultGallery;
            localStorage.setItem('demo_gallery', JSON.stringify(defaultGallery));
        }

        // Load Blog
        const localBlog = localStorage.getItem('demo_blog');
        if (localBlog) {
            appState.blog = JSON.parse(localBlog);
        } else {
            appState.blog = defaultBlog;
            localStorage.setItem('demo_blog', JSON.stringify(defaultBlog));
        }

        // Load Categories
        const localCategories = localStorage.getItem('demo_categories');
        if (localCategories) {
            appState.categories = JSON.parse(localCategories);
        } else {
            appState.categories = defaultCategories;
            localStorage.setItem('demo_categories', JSON.stringify(defaultCategories));
        }

        // Load Bookings & Quotations
        const localQuotes = localStorage.getItem('demo_quotations');
        if (localQuotes) {
            appState.quotations = JSON.parse(localQuotes);
        } else {
            appState.quotations = mockQuotations;
            localStorage.setItem('demo_quotations', JSON.stringify(mockQuotations));
        }

        // Load Invoices
        const localInvoices = localStorage.getItem('demo_invoices');
        if (localInvoices) {
            appState.invoices = JSON.parse(localInvoices);
        } else {
            appState.invoices = mockInvoices;
            localStorage.setItem('demo_invoices', JSON.stringify(mockInvoices));
        }

        // Load Enquiries
        const localEnquiries = localStorage.getItem('demo_enquiries');
        if (localEnquiries) {
            appState.enquiries = JSON.parse(localEnquiries);
        } else {
            appState.enquiries = mockEnquiries;
            localStorage.setItem('demo_enquiries', JSON.stringify(mockEnquiries));
        }

        // Load Media Items
        const localMedia = localStorage.getItem('demo_media_items');
        if (localMedia) {
            appState.mediaItems = JSON.parse(localMedia);
        } else {
            appState.mediaItems = defaultMediaItems;
            localStorage.setItem('demo_media_items', JSON.stringify(defaultMediaItems));
        }

        // Check Login Session
        const sessionToken = sessionStorage.getItem('admin_session');
        const rememberToken = localStorage.getItem('admin_session_remember');
        if (sessionToken === 'active' || rememberToken === 'active') {
            appState.currentUser = { email: 'admin@dewangan.com' };
            if (userDisplayName) userDisplayName.textContent = 'Admin';
            hideAuthOverlays();
            if (isAdminPage) {
                showAdminPortal();
                refreshAllUI();
            } else {
                showPublicSite();
            }
        } else {
            if (isAdminPage) {
                if (loginOverlay) loginOverlay.classList.remove('hidden');
                if (adminPortal) adminPortal.classList.add('hidden');
                if (cancelLoginBtn) cancelLoginBtn.style.display = 'none';
            } else {
                showPublicSite();
            }
        }
    };

    // Firebase listeners for Public collections (Read-only, no auth required)
    const setupPublicFirebaseListeners = () => {
        unsubscribeFunctions.forEach(unsub => unsub());
        unsubscribeFunctions = [];

        // Fallbacks in case Firebase project is not created/configured/empty
        const loadLocalSettingsFallback = () => {
            const localSettings = localStorage.getItem('studio_settings');
            if (localSettings) {
                appState.settings = JSON.parse(localSettings);
            }
            applyStudioSettingsUI();
        };

        const loadLocalServicesFallback = () => {
            const localServices = localStorage.getItem('demo_services');
            if (localServices) {
                appState.services = JSON.parse(localServices);
            } else {
                appState.services = defaultServices;
            }
            renderPublicContent();
        };

        const loadLocalGalleryFallback = () => {
            const localGallery = localStorage.getItem('demo_gallery');
            if (localGallery) {
                appState.gallery = JSON.parse(localGallery);
            } else {
                appState.gallery = defaultGallery;
            }
            renderPublicGallery();
        };

        const loadLocalBlogFallback = () => {
            const localBlog = localStorage.getItem('demo_blog');
            if (localBlog) {
                appState.blog = JSON.parse(localBlog);
            } else {
                appState.blog = defaultBlog;
            }
            renderPublicBlog();
        };

        const loadLocalCategoriesFallback = () => {
            const localCategories = localStorage.getItem('demo_categories');
            if (localCategories) {
                appState.categories = JSON.parse(localCategories);
            } else {
                appState.categories = defaultCategories;
            }
            renderPublicGallery();
        };

        const loadLocalMediaFallback = () => {
            const localMedia = localStorage.getItem('demo_media_items');
            if (localMedia) {
                appState.mediaItems = JSON.parse(localMedia);
            } else {
                appState.mediaItems = defaultMediaItems;
            }
            renderPublicMedia();
        };

        // 1. Sync Settings
        const unsubSettings = fbStore.collection('settings').doc('profile').onSnapshot(doc => {
            if (doc.exists) {
                appState.settings = doc.data();
                applyStudioSettingsUI();
            } else {
                loadLocalSettingsFallback();
            }
        }, err => {
            console.warn("Public Settings sync error:", err);
            loadLocalSettingsFallback();
        });
        unsubscribeFunctions.push(unsubSettings);

        // 2. Sync Services
        const unsubSrv = fbStore.collection('services').orderBy('name').onSnapshot(snap => {
            appState.services = [];
            if (!snap.empty) {
                snap.forEach(doc => {
                    appState.services.push({ id: doc.id, ...doc.data() });
                });
                renderPublicContent();
            } else {
                loadLocalServicesFallback();
            }
        }, err => {
            console.warn("Public Services sync error:", err);
            loadLocalServicesFallback();
        });
        unsubscribeFunctions.push(unsubSrv);

        // 3. Sync Gallery
        const unsubGal = fbStore.collection('gallery').onSnapshot(snap => {
            appState.gallery = [];
            if (!snap.empty) {
                snap.forEach(doc => {
                    appState.gallery.push({ id: doc.id, ...doc.data() });
                });
                renderPublicGallery();
            } else {
                loadLocalGalleryFallback();
            }
        }, err => {
            console.warn("Public Gallery sync error:", err);
            loadLocalGalleryFallback();
        });
        unsubscribeFunctions.push(unsubGal);

        // 4. Sync Blog
        const unsubBlog = fbStore.collection('blog').orderBy('date', 'desc').onSnapshot(snap => {
            appState.blog = [];
            if (!snap.empty) {
                snap.forEach(doc => {
                    appState.blog.push({ id: doc.id, ...doc.data() });
                });
                renderPublicBlog();
            } else {
                loadLocalBlogFallback();
            }
        }, err => {
            console.warn("Public Blog sync error:", err);
            loadLocalBlogFallback();
        });
        unsubscribeFunctions.push(unsubBlog);

        // 5. Sync Categories
        const unsubCat = fbStore.collection('categories').orderBy('title').onSnapshot(snap => {
            appState.categories = [];
            if (!snap.empty) {
                snap.forEach(doc => {
                    appState.categories.push({ id: doc.id, ...doc.data() });
                });
                renderPublicGallery();
            } else {
                loadLocalCategoriesFallback();
            }
        }, err => {
            console.warn("Public Categories sync error:", err);
            loadLocalCategoriesFallback();
        });
        unsubscribeFunctions.push(unsubCat);

        // 6. Sync Media Items
        const unsubMedia = fbStore.collection('mediaItems').orderBy('createdAt', 'desc').onSnapshot(snap => {
            appState.mediaItems = [];
            if (!snap.empty) {
                snap.forEach(doc => {
                    appState.mediaItems.push({ id: doc.id, ...doc.data() });
                });
                renderPublicMedia();
            } else {
                loadLocalMediaFallback();
            }
        }, err => {
            console.warn("Public Media sync error:", err);
            loadLocalMediaFallback();
        });
        unsubscribeFunctions.push(unsubMedia);
    };

    // Firebase listeners for Real-time database sync (Admin version, includes private data)
    const setupFirebaseListeners = () => {
        unsubscribeFunctions.forEach(unsub => unsub());
        unsubscribeFunctions = [];

        // 1. Sync Settings
        const unsubSettings = fbStore.collection('settings').doc('profile').onSnapshot(doc => {
            if (doc.exists) {
                appState.settings = doc.data();
            } else {
                fbStore.collection('settings').doc('profile').set(appState.settings);
            }
            applyStudioSettingsUI();
        });
        unsubscribeFunctions.push(unsubSettings);

        // 2. Sync Customers
        const unsubCust = fbStore.collection('customers').orderBy('name').onSnapshot(snap => {
            appState.customers = [];
            snap.forEach(doc => {
                appState.customers.push({ id: doc.id, ...doc.data() });
            });
            refreshCustomersDropdown();
            renderCustomersList();
            renderDashboard();
        });
        unsubscribeFunctions.push(unsubCust);

        // 3. Sync Services
        const unsubSrv = fbStore.collection('services').orderBy('name').onSnapshot(snap => {
            appState.services = [];
            if (snap.empty) {
                defaultServices.forEach(srv => {
                    fbStore.collection('services').doc(srv.id).set(srv);
                });
            } else {
                snap.forEach(doc => {
                    appState.services.push({ id: doc.id, ...doc.data() });
                });
                renderServicesList();
                renderPublicContent();
            }
        });
        unsubscribeFunctions.push(unsubSrv);

        // 4. Sync Gallery
        const unsubGal = fbStore.collection('gallery').onSnapshot(snap => {
            appState.gallery = [];
            if (snap.empty) {
                defaultGallery.forEach(g => {
                    fbStore.collection('gallery').doc(g.id).set(g);
                });
            } else {
                snap.forEach(doc => {
                    appState.gallery.push({ id: doc.id, ...doc.data() });
                });
                renderAdminGallery();
                renderPublicGallery();
            }
        });
        unsubscribeFunctions.push(unsubGal);

        // 5. Sync Blog
        const unsubBlog = fbStore.collection('blog').orderBy('date', 'desc').onSnapshot(snap => {
            appState.blog = [];
            if (snap.empty) {
                defaultBlog.forEach(b => {
                    fbStore.collection('blog').doc(b.id).set(b);
                });
            } else {
                snap.forEach(doc => {
                    appState.blog.push({ id: doc.id, ...doc.data() });
                });
                renderAdminBlog();
                renderPublicBlog();
            }
        });
        unsubscribeFunctions.push(unsubBlog);

        // 6. Sync Invoices
        const unsubInv = fbStore.collection('invoices').orderBy('date', 'desc').onSnapshot(snap => {
            appState.invoices = [];
            snap.forEach(doc => {
                appState.invoices.push({ id: doc.id, ...doc.data() });
            });
            renderInvoicesList();
            renderDashboard();
        });
        unsubscribeFunctions.push(unsubInv);

        // 7. Sync Bookings/Quotations
        const unsubQuote = fbStore.collection('quotations').orderBy('date', 'desc').onSnapshot(snap => {
            appState.quotations = [];
            snap.forEach(doc => {
                appState.quotations.push({ id: doc.id, ...doc.data() });
            });
            renderBookingsList();
            renderDashboard();
        });
        unsubscribeFunctions.push(unsubQuote);

        // 8. Sync Enquiries
        const unsubEnq = fbStore.collection('enquiries').orderBy('dateSent', 'desc').onSnapshot(snap => {
            appState.enquiries = [];
            snap.forEach(doc => {
                appState.enquiries.push({ id: doc.id, ...doc.data() });
            });
            renderEnquiriesList();
            renderDashboard();
        });
        unsubscribeFunctions.push(unsubEnq);

        // 9. Sync Categories
        const unsubCat = fbStore.collection('categories').orderBy('title').onSnapshot(snap => {
            appState.categories = [];
            if (snap.empty) {
                defaultCategories.forEach(c => {
                    fbStore.collection('categories').doc(c.id).set(c);
                });
            } else {
                snap.forEach(doc => {
                    appState.categories.push({ id: doc.id, ...doc.data() });
                });
                renderCategoriesList();
                refreshGalleryCategoriesDropdown();
                renderPublicGallery();
            }
        });
        unsubscribeFunctions.push(unsubCat);

        // 10. Sync Media Items
        const unsubMedia = fbStore.collection('mediaItems').orderBy('createdAt', 'desc').onSnapshot(snap => {
            appState.mediaItems = [];
            if (snap.empty) {
                defaultMediaItems.forEach(m => {
                    fbStore.collection('mediaItems').doc(m.id).set(m);
                });
            } else {
                snap.forEach(doc => {
                    appState.mediaItems.push({ id: doc.id, ...doc.data() });
                });
                renderAdminMedia();
                renderPublicMedia();
            }
        });
        unsubscribeFunctions.push(unsubMedia);
    };

    // Apply active settings to website UI elements
    const applyStudioSettingsUI = () => {
        console.log("applyStudioSettingsUI - dbType:", appState.dbType, "logoUrl length:", appState.settings.logoUrl ? appState.settings.logoUrl.length : 0);

        if (sidebarStudioName) sidebarStudioName.textContent = appState.settings.studioName.split(' ')[0] || "Dewangan";
        document.title = `${appState.settings.studioName} - Luxury Photography Studio`;
        
        // Public Details
        const pubContactPhone = document.getElementById('pub-contact-phone');
        if (pubContactPhone) {
            pubContactPhone.textContent = appState.settings.studioPhone;
            pubContactPhone.href = `tel:${appState.settings.studioPhone}`;
        }
        
        const pubContactEmail = document.getElementById('pub-contact-email');
        if (pubContactEmail) {
            const emailVal = appState.settings.studioEmail || 'bhaveshdewangan1234@gmail.com';
            pubContactEmail.textContent = emailVal;
            pubContactEmail.href = `mailto:${emailVal}`;
        }
        
        const pubContactAddress = document.getElementById('pub-contact-address');
        if (pubContactAddress) {
            const addressVal = appState.settings.studioAddress || 'Ward No. 16, beside IPS School, Shivpuri, Jamul, Bhilai, Chhattisgarh 490024';
            pubContactAddress.textContent = addressVal;
            if (addressVal.toLowerCase().includes('shivpuri') || addressVal.toLowerCase().includes('jamul')) {
                pubContactAddress.href = "https://share.google/d7PGuJwGXCB5gMjSi";
            } else {
                pubContactAddress.href = `https://maps.google.com/?q=${encodeURIComponent(addressVal)}`;
            }
        }

        const headerPhoneLink = document.getElementById('header-phone-link');
        if (headerPhoneLink) {
            headerPhoneLink.href = `tel:${appState.settings.studioPhone}`;
        }
        const floatingCallBtn = document.getElementById('floating-call-btn');
        if (floatingCallBtn) {
            floatingCallBtn.href = `tel:${appState.settings.studioPhone}`;
        }
        const footerPhoneLink = document.getElementById('footer-phone-link');
        if (footerPhoneLink) {
            footerPhoneLink.href = `tel:${appState.settings.studioPhone}`;
        }

        const pubWhatsappBtns = document.querySelectorAll('.pub-whatsapp-btn');
        const waPhone = appState.settings.studioPhone.replace(/\D/g, '');
        const finalWaPhone = waPhone.startsWith('91') ? waPhone : `91${waPhone}`;
        pubWhatsappBtns.forEach(btn => {
            btn.href = `https://wa.me/${finalWaPhone}?text=Hi%20${encodeURIComponent(appState.settings.studioName)}%2C%20I%20am%20interested%20in%20your%20photography%20services.%20Please%20share%20details.`;
        });

        const updateImgSrc = (id, url) => {
            const img = document.getElementById(id);
            if (img && url) {
                img.src = url;
            }
        };

        updateImgSrc('pub-slide-1', appState.settings.slide1Url);
        updateImgSrc('pub-slide-2', appState.settings.slide2Url);
        updateImgSrc('pub-slide-3', appState.settings.slide3Url);
        updateImgSrc('pub-about-image', appState.settings.aboutImageUrl);

        // Dynamic Brand Logo logic
        const pubBrandLogo = document.getElementById('pub-brand-logo');
        const pubBrandLogoText = document.getElementById('pub-brand-logo-text');
        const pubBrandLogoSvg = document.getElementById('pub-brand-logo-svg');
        const pubFooterLogo = document.getElementById('pub-footer-logo');
        const pubFooterLogoSvg = document.getElementById('pub-footer-logo-svg');
        
        const hasCustomLogo = appState.settings.logoUrl && appState.settings.logoUrl.trim() !== "";
        
        if (pubBrandLogo && pubBrandLogoSvg) {
            if (hasCustomLogo) {
                pubBrandLogo.src = appState.settings.logoUrl;
                pubBrandLogo.classList.remove('hidden');
                pubBrandLogo.classList.add('block');
                
                if (pubBrandLogoText) {
                    pubBrandLogoText.classList.remove('hidden');
                    pubBrandLogoText.style.display = 'flex';
                }
                
                pubBrandLogoSvg.classList.remove('block');
                pubBrandLogoSvg.classList.add('hidden');
            } else {
                pubBrandLogo.classList.remove('block');
                pubBrandLogo.classList.add('hidden');
                
                if (pubBrandLogoText) {
                    pubBrandLogoText.classList.add('hidden');
                    pubBrandLogoText.style.display = 'none';
                }
                
                pubBrandLogoSvg.classList.remove('hidden');
                pubBrandLogoSvg.classList.add('block');
            }
        }
        
        if (pubFooterLogo && pubFooterLogoSvg) {
            if (hasCustomLogo) {
                pubFooterLogo.src = appState.settings.logoUrl;
                pubFooterLogo.classList.remove('hidden');
                pubFooterLogo.classList.add('block');
                pubFooterLogoSvg.classList.remove('block');
                pubFooterLogoSvg.classList.add('hidden');
            } else {
                pubFooterLogo.classList.remove('block');
                pubFooterLogo.classList.add('hidden');
                pubFooterLogoSvg.classList.remove('hidden');
                pubFooterLogoSvg.classList.add('block');
            }
        }

        const pubAboutTitle = document.getElementById('pub-about-title');
        if (pubAboutTitle) pubAboutTitle.textContent = appState.settings.aboutTitle || 'Dewangan Photo & Videography';

        const pubAboutDescContainer = document.getElementById('pub-about-desc-container');
        if (pubAboutDescContainer) pubAboutDescContainer.innerHTML = appState.settings.aboutDescHtml || '';
        updateImgSrc('pub-wedding-cover', appState.settings.weddingCoverUrl);
        updateImgSrc('pub-prewedding-cover', appState.settings.preweddingCoverUrl);
        updateImgSrc('pub-engagement-cover', appState.settings.engagementCoverUrl);
        updateImgSrc('pub-birthday-cover', appState.settings.birthdayCoverUrl);
        updateImgSrc('pub-maternity-cover', appState.settings.maternityCoverUrl);
        updateImgSrc('pub-baby-cover', appState.settings.babyCoverUrl);
        updateImgSrc('pub-videography-cover', appState.settings.videographyCoverUrl);
        updateImgSrc('pub-drone-cover', appState.settings.droneCoverUrl);
        updateImgSrc('pub-album-cover', appState.settings.albumCoverUrl);

        // Studio inputs in settings page
        const setStudioName = document.getElementById('set-studio-name');
        if (setStudioName) setStudioName.value = appState.settings.studioName;
        const setStudioPhone = document.getElementById('set-studio-phone');
        if (setStudioPhone) setStudioPhone.value = appState.settings.studioPhone;
        const setStudioEmail = document.getElementById('set-studio-email');
        if (setStudioEmail) setStudioEmail.value = appState.settings.studioEmail;
        
        const setStudioWebsite = document.getElementById('set-studio-website');
        if (setStudioWebsite) setStudioWebsite.value = appState.settings.studioWebsite || '';
        
        const setStudioAddress = document.getElementById('set-studio-address');
        if (setStudioAddress) setStudioAddress.value = appState.settings.studioAddress;
        const setInvoiceTerms = document.getElementById('set-invoice-terms');
        if (setInvoiceTerms) setInvoiceTerms.value = appState.settings.invoiceTerms;
        const setUpiId = document.getElementById('set-upi-id');
        if (setUpiId) setUpiId.value = appState.settings.upiId;
        const setPayeeName = document.getElementById('set-payee-name');
        if (setPayeeName) setPayeeName.value = appState.settings.payeeName;

        // Redesigned Store Settings specific fields
        const setStudioAltEmail = document.getElementById('set-studio-alt-email');
        if (setStudioAltEmail) setStudioAltEmail.value = appState.settings.alternateEmail || '';

        const setStudioAltPhone = document.getElementById('set-studio-alt-phone');
        if (setStudioAltPhone) setStudioAltPhone.value = appState.settings.alternatePhone || '';

        const setStoreCurrency = document.getElementById('set-store-currency');
        if (setStoreCurrency) setStoreCurrency.value = appState.settings.currency || 'INR';

        updateImgSrc('set-store-logo-preview', appState.settings.logoUrl);
        updateImgSrc('set-store-favicon-preview', appState.settings.faviconUrl);

        // Update favicon dynamically
        const updateFavicon = (url) => {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = url || 'favicon.ico';
        };
        updateFavicon(appState.settings.faviconUrl);

        // Prepopulate About Setting inputs if they exist
        const setAboutTitle = document.getElementById('set-about-title');
        if (setAboutTitle) {
            setAboutTitle.value = appState.settings.aboutTitle || '';
            const descEditor = document.getElementById('set-about-desc-editor');
            if (descEditor) {
                descEditor.innerHTML = appState.settings.aboutDescHtml || '';
            }
            updateImgSrc('set-about-logo-preview', appState.settings.aboutImageUrl);
            
            // Brand Logo preview logic
            const brandPreview = document.getElementById('set-brand-logo-preview');
            const brandPlaceholder = document.getElementById('set-brand-logo-preview-placeholder');
            const resetLogoBtn = document.getElementById('reset-brand-logo-btn');
            if (brandPreview && brandPlaceholder && resetLogoBtn) {
                if (appState.settings.logoUrl) {
                    brandPreview.src = appState.settings.logoUrl;
                    brandPreview.classList.remove('hidden');
                    brandPlaceholder.classList.add('hidden');
                    resetLogoBtn.style.display = 'inline-block';
                } else {
                    brandPreview.src = '';
                    brandPreview.classList.add('hidden');
                    brandPlaceholder.classList.remove('hidden');
                    resetLogoBtn.style.display = 'none';
                }
            }
        }

        // Prepopulate Media Form inputs in Settings pane if they exist
        const setSlide1 = document.getElementById('set-slide-1');
        if (setSlide1) {
            setSlide1.value = appState.settings.slide1Url || '';
            document.getElementById('set-slide-2').value = appState.settings.slide2Url || '';
            document.getElementById('set-slide-3').value = appState.settings.slide3Url || '';
            document.getElementById('set-about-image').value = appState.settings.aboutImageUrl || '';
            document.getElementById('set-wedding-cover').value = appState.settings.weddingCoverUrl || '';
            document.getElementById('set-prewedding-cover').value = appState.settings.preweddingCoverUrl || '';
            document.getElementById('set-engagement-cover').value = appState.settings.engagementCoverUrl || '';
            document.getElementById('set-birthday-cover').value = appState.settings.birthdayCoverUrl || '';
            document.getElementById('set-maternity-cover').value = appState.settings.maternityCoverUrl || '';
            document.getElementById('set-baby-cover').value = appState.settings.babyCoverUrl || '';
            document.getElementById('set-videography-cover').value = appState.settings.videographyCoverUrl || '';
            document.getElementById('set-drone-cover').value = appState.settings.droneCoverUrl || '';
            document.getElementById('set-album-cover').value = appState.settings.albumCoverUrl || '';
        }
    };

    const refreshGalleryCategoriesDropdown = () => {
        const select = document.getElementById('gal-category');
        if (!select) return;
        select.innerHTML = '';
        (appState.categories || []).forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.title;
            select.appendChild(opt);
        });
    };

    const refreshAllUI = () => {
        refreshCustomersDropdown();
        renderCustomersList();
        renderServicesList();
        renderAdminGallery();
        renderAdminBlog();
        renderCategoriesList();
        refreshGalleryCategoriesDropdown();
        renderInvoicesList();
        renderBookingsList();
        renderEnquiriesList();
        renderAdminMedia();
        renderDashboard();
        renderPublicContent();
    };

    // Renders the dynamic public website sections
    const renderPublicContent = () => {
        renderPublicGallery();
        renderPublicBlog();
        renderPublicServices();
        renderPublicMedia();
    };

    // =========================================================================
    // 4. PORTAL SESSIONS CONTROLLER
    // =========================================================================
    
    const showPublicSite = () => {
        if (isAdminPage) {
            window.location.href = 'index.html';
            return;
        }
        if (publicSite) publicSite.classList.remove('hidden');
        if (adminPortal) adminPortal.classList.add('hidden');
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (onboardingOverlay) onboardingOverlay.classList.add('hidden');
        renderPublicContent();
    };

    const showAdminPortal = () => {
        if (!isAdminPage) {
            window.location.href = 'admin.html';
            return;
        }
        if (publicSite) publicSite.classList.add('hidden');
        if (adminPortal) adminPortal.classList.remove('hidden');
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (onboardingOverlay) onboardingOverlay.classList.add('hidden');
    };

    const hideAuthOverlays = () => {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (onboardingOverlay) onboardingOverlay.classList.add('hidden');
    };

    // Password view toggle
    if (toggleLoginPassBtn) toggleLoginPassBtn.addEventListener('click', () => {
        const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassword.setAttribute('type', type);
        toggleLoginPassBtn.querySelector('i').classList.toggle('fa-eye');
        toggleLoginPassBtn.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Login Form Submit
    if (loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const pass = loginPassword.value;
        const remember = document.getElementById('login-remember').checked;

        if (appState.dbType === 'demo') {
            if (email === 'admin@dewangan.com' && pass === appState.settings.adminPassword) {
                appState.currentUser = { email: 'admin@dewangan.com' };
                userDisplayName.textContent = 'Admin';
                
                sessionStorage.setItem('admin_session', 'active');
                if (remember) {
                    localStorage.setItem('admin_session_remember', 'active');
                }
                
                showToast("Login Successful!");
                hideAuthOverlays();
                showAdminPortal();
                refreshAllUI();
            } else {
                showToast("Invalid credentials for admin login.", "error");
            }
        } else {
            fbAuth.signInWithEmailAndPassword(email, pass)
                .then(userCred => {
                    showToast("Login Successful!");
                    hideAuthOverlays();
                    showAdminPortal();
                })
                .catch(err => {
                    console.error("Firebase Login Fail:", err);
                    if (err.code === 'auth/user-not-found') {
                        const confirmReg = confirm("This email is not registered. Register it as the primary Admin Account?");
                        if (confirmReg) {
                            fbAuth.createUserWithEmailAndPassword(email, pass)
                                .then(userCred => {
                                    showToast("Admin account registered successfully!");
                                    hideAuthOverlays();
                                    showAdminPortal();
                                })
                                .catch(regErr => {
                                    showToast("Registration failed: " + regErr.message, "error");
                                });
                        }
                    } else {
                        showToast(err.message, "error");
                    }
                });
        }
    });

    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        if (appState.dbType === 'demo') {
            sessionStorage.removeItem('admin_session');
            localStorage.removeItem('admin_session_remember');
            appState.currentUser = null;
            showPublicSite();
        } else {
            fbAuth.signOut().then(() => {
                appState.currentUser = null;
                showPublicSite();
            });
        }
    });

    // Skip cloud setup and run local demo mode
    if (skipOnboardingBtn) skipOnboardingBtn.addEventListener('click', () => {
        localStorage.removeItem('firebase_config');
        appState.dbType = 'demo';
        initDemoMode();
    });

    // Onboarding Form (Firebase config)
    if (onboardingForm) onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawJson = firebaseConfigInput.value.trim();
        
        try {
            let configJson = rawJson;
            if (rawJson.includes('const') || rawJson.includes('firebaseConfig')) {
                const startIndex = rawJson.indexOf('{');
                const endIndex = rawJson.lastIndexOf('}') + 1;
                configJson = rawJson.substring(startIndex, endIndex);
            }
            
            const cleanJsonStr = configJson
                .replace(/([a-zA-Z0-9]+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']');

            const configObj = JSON.parse(cleanJsonStr);
            
            if (!configObj.apiKey || !configObj.projectId || !configObj.appId) {
                throw new Error("Missing required Firebase fields.");
            }

            localStorage.setItem('firebase_config', JSON.stringify(configObj));
            showToast("Cloud config saved! Reconnecting...");
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            alert("Failed to parse Firebase Config. Make sure it is a valid object.\nDetails: " + err.message);
        }
    });

    // Disconnect Firebase Cloud
    if (disconnectFbBtn) disconnectFbBtn.addEventListener('click', () => {
        const confirmDisc = confirm("Are you sure you want to disconnect Cloud Sync? The application will switch back to local offline mode.");
        if (confirmDisc) {
            localStorage.removeItem('firebase_config');
            if (fbAuth) {
                fbAuth.signOut().finally(() => {
                    location.reload();
                });
            } else {
                location.reload();
            }
        }
    });

    // Update Firebase from settings
    if (updateFbConfigBtn) updateFbConfigBtn.addEventListener('click', () => {
        const rawJson = setFirebaseConfigJson.value.trim();
        if (!rawJson) {
            showToast("Please enter a valid Firebase JSON configuration", "error");
            return;
        }
        try {
            const configObj = JSON.parse(rawJson);
            localStorage.setItem('firebase_config', JSON.stringify(configObj));
            showToast("Config updated! Reloading...");
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            alert("Error parsing JSON config: " + err.message);
        }
    });

    // =========================================================================
    // 5. PUBLIC SITE ENQUIRY SUBMISSIONS
    // =========================================================================
    
    if (publicEnquiryForm) publicEnquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('enq-name').value.trim();
        const mobile = document.getElementById('enq-mobile').value.trim();
        const email = document.getElementById('enq-email').value.trim();
        const eventType = document.getElementById('enq-event-type').value;
        const eventDate = document.getElementById('enq-event-date').value;
        const eventLocation = document.getElementById('enq-event-loc').value.trim();
        const message = document.getElementById('enq-msg').value.trim();

        if (mobile.length < 10) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        const enquiryData = {
            name,
            mobile,
            email,
            eventType,
            eventDate,
            eventLocation,
            message,
            dateSent: new Date().toISOString(),
            status: 'Pending'
        };

        if (appState.dbType === 'demo') {
            enquiryData.id = 'enq_' + Date.now();
            appState.enquiries.push(enquiryData);
            localStorage.setItem('demo_enquiries', JSON.stringify(appState.enquiries));
            
            showToast("Your enquiry has been sent successfully!");
            publicEnquiryForm.reset();
            renderEnquiriesList();
            renderDashboard();
        } else {
            fbStore.collection('enquiries').add(enquiryData)
                .then(() => {
                    showToast("Your enquiry has been sent successfully!");
                    publicEnquiryForm.reset();
                })
                .catch(err => {
                    showToast("Failed to send enquiry: " + err.message, "error");
                });
        }
    });

    // =========================================================================
    // 6. PORTAL NAVIGATION
    // =========================================================================
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    const switchTab = (tabId) => {
        if (!appState.currentUser) return;

        navItems.forEach(i => i.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (activeNav) activeNav.classList.add('active');

        tabContents.forEach(content => content.classList.remove('active'));
        const targetTab = document.getElementById(`tab-${tabId}`);
        if (targetTab) targetTab.classList.add('active');

        let title = "Dashboard";
        let desc = "Overview of your studio's operations, bookings, and revenue.";

        switch (tabId) {
            case 'dashboard':
                title = "Dashboard";
                desc = "Overview of your studio's operations, bookings, and revenue.";
                renderDashboard();
                break;
            case 'bookings':
                title = "Booking Ledger";
                desc = "Manage quotations, active event bookings, and completed photoshoot sessions.";
                renderBookingsList();
                break;
            case 'invoices':
                title = "Invoices Ledger";
                desc = "Track billing cycles, record client payments, and print invoices.";
                renderInvoicesList();
                break;
            case 'customers':
                title = "Customer Directory";
                desc = "View customer profiles, contact numbers, and photoshoot histories.";
                renderCustomersList();
                break;
            case 'enquiries':
                title = "Client Enquiry Submissions";
                desc = "Review and convert photoshoot enquiry requests sent from the public website.";
                renderEnquiriesList();
                break;
            case 'services':
                title = "Photoshoot Packages";
                desc = "Set prices and configurations for active studio service packages.";
                renderServicesList();
                break;
            case 'manage-gallery':
                title = "Manage Public Gallery";
                desc = "Add, edit, or delete the photographs visible on the website portfolio.";
                renderAdminGallery();
                break;
            case 'categories':
                title = "Category List";
                desc = "Add, edit, or delete dynamic portfolio category tags that filter your public website gallery.";
                renderCategoriesList();
                break;
            case 'manage-blog':
                title = "Manage Public Blog";
                desc = "Write, edit, or delete articles and guides published on the studio blog.";
                renderAdminBlog();
                break;
            case 'reports':
                title = "Financial Analytics & Reports";
                desc = "Analyze revenue, track outstanding balances, and print ledger statements.";
                initializeReportsTab();
                break;
            case 'terms':
                title = "Terms & Conditions Rules";
                desc = "Standard contract rules and legal guidelines for client signatures.";
                break;
            case 'media-manager':
                title = "Manage Media Links";
                desc = "Add, edit, or delete streaming YouTube videos/shorts and Instagram posts/reels shown on the public site.";
                renderAdminMedia();
                break;
            case 'about-setting':
                title = "About Setting";
                desc = "Update details about your photography studio, write about your legacy, and upload a brand image.";
                break;
            case 'settings':
                title = "Settings Panel";
                desc = "Configure studio profile, UPI payment codes, and cloud configurations.";
                break;
        }

        if (activeTabTitle) activeTabTitle.textContent = title;
        if (activeTabDesc) activeTabDesc.textContent = desc;
    };

    // Settings Navigation
    settingsNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            settingsNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sectionId = btn.getAttribute('data-sec') || btn.getAttribute('data-section');
            settingsSections.forEach(sec => sec.classList.remove('active'));
            const targetSec = document.getElementById(`settings-section-${sectionId}`);
            if (targetSec) {
                targetSec.classList.add('active');
            }
        });
    });

    // Theme toggle switch (CSS Attribute handler)
    if (themeToggle) themeToggle.addEventListener('change', () => {
        const targetTheme = themeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        
        // Handle Admin Light Theme Switch
        if (targetTheme === 'light') {
            adminPortal.setAttribute('data-theme-light', 'true');
        } else {
            adminPortal.removeAttribute('data-theme-light');
        }
        
        if (revenueChart) setTimeout(renderRevenueChart, 100);
    });

    if (typeof dashViewBookingsLink !== 'undefined' && dashViewBookingsLink) {
        dashViewBookingsLink.addEventListener('click', () => switchTab('bookings'));
    }
    if (typeof dashViewCustomersLink !== 'undefined' && dashViewCustomersLink) {
        dashViewCustomersLink.addEventListener('click', () => switchTab('customers'));
    }

    // =========================================================================
    // 7. CUSTOMER DIRECTORY CONTROLLER
    // =========================================================================
    
    if (addCustomerBtn) addCustomerBtn.addEventListener('click', () => {
        document.getElementById('customer-modal-title').textContent = "Add New Customer";
        customerForm.reset();
        document.getElementById('cust-id-hidden').value = '';
        customerModal.classList.remove('hidden');
    });

    const closeCustomerModal = () => {
        customerModal.classList.add('hidden');
    };
    if (closeCustomerModalBtn) closeCustomerModalBtn.addEventListener('click', closeCustomerModal);
    if (cancelCustomerModalBtn) cancelCustomerModalBtn.addEventListener('click', closeCustomerModal);

    if (customerForm) customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cust-id-hidden').value;
        const name = document.getElementById('cust-name').value.trim();
        const mobile = document.getElementById('cust-mobile').value.trim();
        const email = document.getElementById('cust-email').value.trim();
        const address = document.getElementById('cust-address').value.trim();

        const custData = { name, mobile, email, address };

        if (appState.dbType === 'demo') {
            if (id) {
                const idx = appState.customers.findIndex(c => c.id === id);
                if (idx !== -1) {
                    appState.customers[idx] = { id, ...custData };
                    localStorage.setItem('demo_customers', JSON.stringify(appState.customers));
                    showToast("Customer updated successfully!");
                }
            } else {
                const newId = 'cust_' + Date.now();
                appState.customers.push({ id: newId, ...custData });
                localStorage.setItem('demo_customers', JSON.stringify(appState.customers));
                showToast("Customer registered successfully!");
            }
            closeCustomerModal();
            refreshAllUI();
        } else {
            let dbPromise;
            if (id) {
                dbPromise = fbStore.collection('customers').doc(id).update(custData);
            } else {
                dbPromise = fbStore.collection('customers').add(custData);
            }

            dbPromise.then(() => {
                showToast("Customer saved in cloud!");
                closeCustomerModal();
            }).catch(err => {
                showToast("Cloud write failed: " + err.message, "error");
            });
        }
    });

    const renderCustomersList = () => {
        const query = document.getElementById('customer-search-input').value.toLowerCase();
        customersGrid.innerHTML = '';

        const filtered = appState.customers.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.mobile.includes(query) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            (c.address && c.address.toLowerCase().includes(query))
        );

        if (filtered.length === 0) {
            customersGrid.innerHTML = `
                <div class="empty-state-card card-styled text-center btn-full" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-users-slash text-muted mt-20" style="font-size: 40px; margin-bottom:16px;"></i>
                    <h4>No Customers Found</h4>
                    <p class="text-muted">Try searching another customer name or register a new contact.</p>
                </div>`;
            return;
        }

        filtered.forEach(cust => {
            const custBookings = appState.quotations.filter(q => q.customerId === cust.id);
            const totalBilling = custBookings.reduce((sum, b) => sum + b.grandTotal, 0);
            
            const custInvoices = appState.invoices.filter(i => i.customerId === cust.id);
            const outstanding = custInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

            const outstandingHtml = outstanding > 0 
                ? `<span class="outstanding-badge text-red" style="font-weight:700; background:rgba(239, 68, 68, 0.1); padding: 4px 8px; border-radius: 4px; font-size:11px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-circle-exclamation"></i> Balance: ₹${outstanding.toLocaleString('en-IN')}</span>` 
                : `<span class="outstanding-badge text-green" style="font-weight:700; background:rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px; font-size:11px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-circle-check"></i> Paid Clear</span>`;

            const card = document.createElement('div');
            card.className = 'customer-card';
            card.innerHTML = `
                <div class="customer-card-header">
                    <div class="customer-icon"><i class="fa-solid fa-user"></i></div>
                    <div class="customer-title-block">
                        <h4>${cust.name}</h4>
                        <p>ID: ${cust.id.substring(0,8)}</p>
                    </div>
                </div>
                <div class="customer-contact-items">
                    <div class="customer-contact-item"><i class="fa-solid fa-phone"></i> ${cust.mobile}</div>
                    ${cust.email ? `<div class="customer-contact-item"><i class="fa-regular fa-envelope"></i> ${cust.email}</div>` : ''}
                    ${cust.address ? `<div class="customer-contact-item"><i class="fa-solid fa-location-dot"></i> ${cust.address}</div>` : ''}
                </div>
                <div class="customer-history-pill" style="margin-bottom:12px;">
                    <span>Events: <strong>${custBookings.length}</strong></span>
                    <span>Total Billing: <strong>₹${totalBilling.toLocaleString('en-IN')}</strong></span>
                </div>
                <div style="margin-bottom: 15px; display: flex; align-items: center;">
                    ${outstandingHtml}
                </div>
                <div class="customer-card-actions" style="display:flex; gap:8px;">
                    <button class="table-action-btn view" title="Edit Client" data-id="${cust.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="table-action-btn delete" title="Delete Client" data-id="${cust.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ${outstanding > 0 ? `
                    <button class="table-action-btn whatsapp-reminder" title="Send WhatsApp Payment Reminder" data-id="${cust.id}" style="background-color: #25d366; color: white; display:flex; align-items:center; gap:6px; font-size:11px; padding:6px 12px; margin-left:auto; border-radius:4px; font-weight:700;">
                        <i class="fa-brands fa-whatsapp"></i> Reminder
                    </button>
                    ` : ''}
                </div>
            `;

            card.querySelector('.view').addEventListener('click', (e) => {
                e.stopPropagation();
                editCustomer(cust.id);
            });

            card.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomer(cust.id);
            });

            const reminderBtn = card.querySelector('.whatsapp-reminder');
            if (reminderBtn) {
                reminderBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sendPaymentReminder(cust.id);
                });
            }

            customersGrid.appendChild(card);
        });
    };

    const sendPaymentReminder = (customerId) => {
        const cust = appState.customers.find(c => c.id === customerId);
        if (!cust) return;
        const custInvoices = appState.invoices.filter(i => i.customerId === cust.id);
        const outstanding = custInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
        if (outstanding <= 0) return;

        const message = `नमस्कार ${cust.name} जी,\n\nयह Dewangan Photo & Videography की ओर से एक विनम्र अनुस्मारक (reminder) है। आपके फोटोशूट का ₹${outstanding.toLocaleString('en-IN')} का भुगतान बकाया (outstanding balance) है।\n\nकृपया इसे जल्द से जल्द हमारे UPI ID: ${appState.settings.upiId} पर या इनवॉइस में दिए गए UPI QR कोड को स्कैन करके भुगतान करने की कृपा करें।\n\nधन्यवाद!\nDewangan Photo & Videography\nContact: ${appState.settings.studioPhone}`;
        
        const encodedText = encodeURIComponent(message);
        const mobileNum = cust.mobile.replace(/[^0-9]/g, '');
        const targetMobile = mobileNum.length === 10 ? '91' + mobileNum : mobileNum;
        
        window.open(`https://api.whatsapp.com/send?phone=${targetMobile}&text=${encodedText}`, '_blank');
    };

    const customerSearchInput = document.getElementById('customer-search-input');
    if (customerSearchInput) customerSearchInput.addEventListener('input', renderCustomersList);

    const editCustomer = (id) => {
        const cust = appState.customers.find(c => c.id === id);
        if (!cust) return;

        document.getElementById('customer-modal-title').textContent = "Edit Customer Details";
        document.getElementById('cust-id-hidden').value = cust.id;
        document.getElementById('cust-name').value = cust.name;
        document.getElementById('cust-mobile').value = cust.mobile;
        document.getElementById('cust-email').value = cust.email || '';
        document.getElementById('cust-address').value = cust.address || '';

        customerModal.classList.remove('hidden');
    };

    const deleteCustomer = (id) => {
        const cust = appState.customers.find(c => c.id === id);
        if (!cust) return;

        const hasDocs = appState.quotations.some(q => q.customerId === id);
        if (hasDocs) {
            alert("This customer has bookings linked to their profile. Delete the bookings first to delete the contact.");
            return;
        }

        const confirmDel = confirm(`Are you sure you want to delete client record "${cust.name}"?`);
        if (!confirmDel) return;

        if (appState.dbType === 'demo') {
            appState.customers = appState.customers.filter(c => c.id !== id);
            localStorage.setItem('demo_customers', JSON.stringify(appState.customers));
            showToast("Customer deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('customers').doc(id).delete()
                .then(() => showToast("Customer deleted from Cloud."))
                .catch(err => showToast("Delete failed: " + err.message, "error"));
        }
    };

    const refreshCustomersDropdown = () => {
        docCustomerSelect.innerHTML = '<option value="" disabled selected>-- Select a Client --</option>';
        appState.customers.forEach(cust => {
            const opt = document.createElement('option');
            opt.value = cust.id;
            opt.textContent = `${cust.name} (${cust.mobile})`;
            docCustomerSelect.appendChild(opt);
        });
    };

    if (docCustomerSelect) {
        docCustomerSelect.addEventListener('change', () => {
            const id = docCustomerSelect.value;
            const cust = appState.customers.find(c => c.id === id);
            if (cust) {
                wizCustName.textContent = cust.name;
                wizCustPhone.textContent = `Mob: ${cust.mobile}`;
                wizCustAddress.textContent = cust.address ? `Add: ${cust.address}` : 'No address provided';
                wizardCustPreview.classList.remove('hidden');
            } else {
                wizardCustPreview.classList.add('hidden');
            }
        });
    }

    if (wizardQuickAddCust) {
        wizardQuickAddCust.addEventListener('click', () => {
            document.getElementById('customer-modal-title').textContent = "Quick Add Customer";
            customerForm.reset();
            document.getElementById('cust-id-hidden').value = '';
            customerModal.classList.remove('hidden');
            customerModal.style.zIndex = '60';
        });
    }

    // Reset customer overlay modal priority
    const cleanCustomerZIndex = () => { customerModal.style.zIndex = ''; };
    if (closeCustomerModalBtn) closeCustomerModalBtn.addEventListener('click', cleanCustomerZIndex);
    if (cancelCustomerModalBtn) cancelCustomerModalBtn.addEventListener('click', cleanCustomerZIndex);

    // =========================================================================
    // 8. PHOTOSHOOT SERVICES MANAGER
    // =========================================================================
    
    if (addCustomServiceBtn) addCustomServiceBtn.addEventListener('click', () => {
        document.getElementById('service-modal-title').textContent = "Add Custom Service";
        serviceForm.reset();
        document.getElementById('service-id-hidden').value = '';
        serviceModal.classList.remove('hidden');
    });

    const closeServiceModal = () => {
        serviceModal.classList.add('hidden');
    };
    if (closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', closeServiceModal);
    if (cancelServiceModalBtn) cancelServiceModalBtn.addEventListener('click', closeServiceModal);

    if (serviceForm) serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('service-id-hidden').value;
        const name = document.getElementById('srv-name').value.trim();
        const basePrice = parseFloat(document.getElementById('srv-price').value);
        const icon = document.getElementById('srv-icon').value;

        const srvData = { name, basePrice, icon, enabled: true };

        if (appState.dbType === 'demo') {
            if (id) {
                const idx = appState.services.findIndex(s => s.id === id);
                if (idx !== -1) {
                    appState.services[idx] = { id, ...srvData };
                    localStorage.setItem('demo_services', JSON.stringify(appState.services));
                    showToast("Service Package updated successfully!");
                }
            } else {
                const newId = 'srv_' + Date.now();
                appState.services.push({ id: newId, ...srvData });
                localStorage.setItem('demo_services', JSON.stringify(appState.services));
                showToast("Service Package added successfully!");
            }
            closeServiceModal();
            refreshAllUI();
        } else {
            let dbPromise;
            if (id) {
                dbPromise = fbStore.collection('services').doc(id).update(srvData);
            } else {
                const newId = 'srv_' + Date.now();
                dbPromise = fbStore.collection('services').doc(newId).set({ id: newId, ...srvData });
            }

            dbPromise.then(() => {
                showToast("Service saved in Cloud!");
                closeServiceModal();
            }).catch(err => {
                showToast("Failed to save: " + err.message, "error");
            });
        }
    });

    const renderServicesList = () => {
        servicesGrid.innerHTML = '';
        appState.services.forEach(srv => {
            const card = document.createElement('div');
            card.className = `service-card ${srv.enabled ? '' : 'disabled'}`;
            card.innerHTML = `
                <div class="service-card-icon"><i class="fa-solid ${srv.icon || 'fa-camera'}"></i></div>
                <h4>${srv.name}</h4>
                <div class="service-card-price">₹${srv.basePrice.toLocaleString('en-IN')}<small>/ event</small></div>
                <div class="service-card-toggle">
                    <span>Active Package</span>
                    <label class="switch-container">
                        <input type="checkbox" class="srv-enable-toggle" data-id="${srv.id}" ${srv.enabled ? 'checked' : ''}>
                        <span class="switch-slider"></span>
                    </label>
                </div>
                <div class="service-card-actions">
                    <button class="table-action-btn view" title="Edit Service" data-id="${srv.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="table-action-btn delete" title="Delete Service" data-id="${srv.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            card.querySelector('.srv-enable-toggle').addEventListener('change', (e) => {
                toggleServiceEnabled(srv.id, e.target.checked);
            });

            card.querySelector('.view').addEventListener('click', () => editService(srv.id));
            card.querySelector('.delete').addEventListener('click', () => deleteService(srv.id));

            servicesGrid.appendChild(card);
        });
    };

    const toggleServiceEnabled = (id, isChecked) => {
        if (appState.dbType === 'demo') {
            const idx = appState.services.findIndex(s => s.id === id);
            if (idx !== -1) {
                appState.services[idx].enabled = isChecked;
                localStorage.setItem('demo_services', JSON.stringify(appState.services));
                showToast(isChecked ? "Service Activated" : "Service Deactivated");
                refreshAllUI();
            }
        } else {
            fbStore.collection('services').doc(id).update({ enabled: isChecked })
                .then(() => showToast(isChecked ? "Service Activated" : "Service Deactivated"))
                .catch(err => showToast(err.message, "error"));
        }
    };

    const editService = (id) => {
        const srv = appState.services.find(s => s.id === id);
        if (!srv) return;

        document.getElementById('service-modal-title').textContent = "Edit Service Details";
        document.getElementById('service-id-hidden').value = srv.id;
        document.getElementById('srv-name').value = srv.name;
        document.getElementById('srv-price').value = srv.basePrice;
        document.getElementById('srv-icon').value = srv.icon || 'fa-camera';

        serviceModal.classList.remove('hidden');
    };

    const deleteService = (id) => {
        const srv = appState.services.find(s => s.id === id);
        if (!srv) return;

        const confirmDel = confirm(`Are you sure you want to delete photoshoot package "${srv.name}"?`);
        if (!confirmDel) return;

        if (appState.dbType === 'demo') {
            appState.services = appState.services.filter(s => s.id !== id);
            localStorage.setItem('demo_services', JSON.stringify(appState.services));
            showToast("Service deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('services').doc(id).delete()
                .then(() => showToast("Service deleted from Cloud."))
                .catch(err => showToast("Delete failed: " + err.message, "error"));
        }
    };

    // =========================================================================
    // NEW: MANAGE GALLERY CONTROLLER
    // =========================================================================

    if (adminAddGalleryBtn) {
        if (adminAddGalleryBtn) adminAddGalleryBtn.addEventListener('click', () => {
            console.log("Add Gallery Image clicked");
            const modalTitle = document.getElementById('gallery-modal-title');
            if (modalTitle) modalTitle.textContent = "Add Gallery Image";
            
            if (adminGalleryForm) {
                adminGalleryForm.reset();
            }
            
            const hiddenId = document.getElementById('gallery-id-hidden');
            if (hiddenId) hiddenId.value = '';
            
            if (typeof window.resetGalleryUploader === 'function') {
                window.resetGalleryUploader('');
            }
            
            if (adminGalleryModal) {
                adminGalleryModal.classList.remove('hidden');
            }
        });
    }

    const closeGalleryModal = () => {
        adminGalleryModal.classList.add('hidden');
    };
    if (closeGalleryModalBtn) closeGalleryModalBtn.addEventListener('click', closeGalleryModal);
    if (cancelGalleryModalBtn) cancelGalleryModalBtn.addEventListener('click', closeGalleryModal);

    if (adminGalleryForm) adminGalleryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('gallery-id-hidden').value;
        const title = document.getElementById('gal-title').value.trim();
        const category = document.getElementById('gal-category').value;
        const url = document.getElementById('gal-url').value.trim();
        const desc = document.getElementById('gal-desc').value.trim() || 'Dewangan capture';

        const galData = { title, category, url, desc };

        if (appState.dbType === 'demo') {
            if (id) {
                const idx = appState.gallery.findIndex(g => g.id === id);
                if (idx !== -1) {
                    appState.gallery[idx] = { id, ...galData };
                    localStorage.setItem('demo_gallery', JSON.stringify(appState.gallery));
                    showToast("Gallery Image updated successfully!");
                }
            } else {
                const newId = 'gal_' + Date.now();
                appState.gallery.push({ id: newId, ...galData });
                localStorage.setItem('demo_gallery', JSON.stringify(appState.gallery));
                showToast("Gallery Image added successfully!");
            }
            closeGalleryModal();
            refreshAllUI();
        } else {
            let dbPromise;
            if (id) {
                dbPromise = fbStore.collection('gallery').doc(id).update(galData);
            } else {
                const newId = 'gal_' + Date.now();
                dbPromise = fbStore.collection('gallery').doc(newId).set({ id: newId, ...galData });
            }
            dbPromise.then(() => {
                showToast("Image synced to cloud!");
                closeGalleryModal();
            }).catch(err => showToast(err.message, "error"));
        }
    });

    const renderAdminGallery = () => {
        adminGalleryGridContainer.innerHTML = '';
        if (appState.gallery.length === 0) {
            adminGalleryGridContainer.innerHTML = `
                <div class="empty-state-card card-styled text-center btn-full" style="grid-column: 1/-1; padding: 40px; border: 1px dashed #e2e8f0; background: #fafafa;">
                    <i class="fa-solid fa-images text-muted" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
                    <h4 class="font-bold text-gray-700">No Gallery Photos</h4>
                    <p class="text-stone-400 text-xs mt-2">Click 'Add New Image' above to upload photos to your website.</p>
                </div>`;
            return;
        }
        
        appState.gallery.forEach(img => {
            const card = document.createElement('div');
            card.className = "bg-white rounded border border-gray-200 overflow-hidden shadow-sm flex flex-col p-2 transition hover:shadow-md";
            
            // Re-mapping category names to readable ones
            let categoryLabel = img.category || 'general';
            if (categoryLabel === 'wedding') categoryLabel = 'Wedding Shoot';
            else if (categoryLabel === 'prewedding') categoryLabel = 'Pre Wedding Shoot';
            else if (categoryLabel === 'engagement') categoryLabel = 'Engagement Shoot';
            else if (categoryLabel === 'birthday') categoryLabel = 'Candid Shoot';
            else if (categoryLabel === 'maternity') categoryLabel = 'Maternity Shoot';
            else if (categoryLabel === 'drone') categoryLabel = 'Drone Shoot';
            else categoryLabel = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1) + ' Shoot';

            card.innerHTML = `
                <div class="relative w-full overflow-hidden bg-stone-100 rounded-sm" style="aspect-ratio: 1/1; display: block; position: relative;">
                    <img src="${img.url}" class="absolute inset-0 w-full h-full object-cover select-none">
                </div>
                <div class="pt-2 flex flex-col items-center justify-between flex-grow gap-2" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; flex-grow: 1;">
                    <h4 class="text-xs font-semibold text-gray-800 text-center select-none" style="margin: 0; font-weight: 600; line-height: 1.2;">${categoryLabel}</h4>
                    <button type="button" class="w-full py-1.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-[9px] uppercase tracking-wider rounded-sm shadow-sm transition delete-btn cursor-pointer" style="border: none;">
                        Delete
                    </button>
                </div>
            `;
            
            card.querySelector('.delete-btn').addEventListener('click', () => deleteGalleryImage(img.id));
            adminGalleryGridContainer.appendChild(card);
        });
    };

    const editGalleryImage = (id) => {
        const img = appState.gallery.find(g => g.id === id);
        if (!img) return;
        document.getElementById('gallery-modal-title').textContent = "Edit Gallery Details";
        document.getElementById('gallery-id-hidden').value = img.id;
        document.getElementById('gal-title').value = img.title;
        document.getElementById('gal-category').value = img.category;
        document.getElementById('gal-desc').value = img.desc || '';
        window.resetGalleryUploader(img.url);
        adminGalleryModal.classList.remove('hidden');
    };

    const deleteGalleryImage = (id) => {
        const confirmDel = confirm("Are you sure you want to delete this image from your public portfolio?");
        if (!confirmDel) return;
        if (appState.dbType === 'demo') {
            appState.gallery = appState.gallery.filter(g => g.id !== id);
            localStorage.setItem('demo_gallery', JSON.stringify(appState.gallery));
            showToast("Image deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('gallery').doc(id).delete()
                .then(() => showToast("Deleted from cloud."))
                .catch(err => showToast(err.message, "error"));
        }
    };

    // =========================================================================
    // NEW: CATEGORY LIST CONTROLLER
    // =========================================================================
    const adminAddCategoryBtn = document.getElementById('admin-add-category-btn');
    const adminCategoryModal = document.getElementById('admin-category-modal');
    const adminCategoryForm = document.getElementById('admin-category-form');
    const closeCategoryModalBtn = document.getElementById('close-category-modal-btn');
    const cancelCategoryModalBtn = document.getElementById('cancel-category-modal-btn');
    const adminCategoryListTbody = document.getElementById('admin-category-list-tbody');
    
    if (adminAddCategoryBtn) {
        if (adminAddCategoryBtn) adminAddCategoryBtn.addEventListener('click', () => {
            document.getElementById('category-modal-title').textContent = "Add New Category";
            adminCategoryForm.reset();
            document.getElementById('category-id-hidden').value = '';
            resetCategoryUploader('');
            adminCategoryModal.classList.remove('hidden');
        });
    }

    const resetCategoryUploader = (existingUrl = '') => {
        const fileInput = document.getElementById('cat-file-input');
        const content = document.getElementById('cat-dropzone-content');
        const preview = document.getElementById('cat-dropzone-preview');
        const previewImg = document.getElementById('cat-preview-img');
        const hiddenUrlInput = document.getElementById('cat-url');
        
        if (!fileInput) return;
        fileInput.value = '';
        if (existingUrl) {
            hiddenUrlInput.value = existingUrl;
            previewImg.src = existingUrl;
            content.classList.add('hidden');
            preview.classList.remove('hidden');
        } else {
            hiddenUrlInput.value = '';
            previewImg.src = '';
            preview.classList.add('hidden');
            content.classList.remove('hidden');
        }
    };

    const initCategoryUploader = () => {
        const dropzone = document.getElementById('cat-upload-dropzone');
        const fileInput = document.getElementById('cat-file-input');
        const content = document.getElementById('cat-dropzone-content');
        const preview = document.getElementById('cat-dropzone-preview');
        const previewImg = document.getElementById('cat-preview-img');
        const removeBtn = document.getElementById('cat-remove-preview-btn');
        const hiddenUrlInput = document.getElementById('cat-url');
        
        if (!dropzone || !fileInput) return;
        
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('.remove-preview-btn')) return;
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                const file = files[0];
                if (!file.type.startsWith('image/')) {
                    showToast("Please select an image file.", "error");
                    return;
                }
                showToast("Compressing category image...");
                compressImageFile(file, 400, 400)
                    .then(base64Url => {
                        hiddenUrlInput.value = base64Url;
                        previewImg.src = base64Url;
                        content.classList.add('hidden');
                        preview.classList.remove('hidden');
                        showToast("Image loaded successfully!");
                    })
                    .catch(err => {
                        console.error(err);
                        showToast("Failed to process image.", "error");
                    });
            }
        });
        
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.value = '';
                hiddenUrlInput.value = '';
                previewImg.src = '';
                preview.classList.add('hidden');
                content.classList.remove('hidden');
            });
        }
    };

    const closeCategoryModal = () => {
        if (adminCategoryModal) adminCategoryModal.classList.add('hidden');
    };
    if (closeCategoryModalBtn) if (closeCategoryModalBtn) closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
    if (cancelCategoryModalBtn) if (cancelCategoryModalBtn) cancelCategoryModalBtn.addEventListener('click', closeCategoryModal);

    if (adminCategoryForm) {
        if (adminCategoryForm) adminCategoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('category-id-hidden').value;
            const title = document.getElementById('cat-title').value.trim();
            const desc = document.getElementById('cat-desc').value.trim();
            const imgUrl = document.getElementById('cat-url').value.trim();
            
            const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const catData = { title, desc, imgUrl, createdAt: dateStr };
            
            if (appState.dbType === 'demo') {
                if (id) {
                    const idx = appState.categories.findIndex(c => c.id === id);
                    if (idx !== -1) {
                        appState.categories[idx] = { id, ...catData };
                        localStorage.setItem('demo_categories', JSON.stringify(appState.categories));
                        showToast("Category updated successfully!");
                    }
                } else {
                    const newId = 'cat_' + Date.now();
                    appState.categories.push({ id: newId, ...catData });
                    localStorage.setItem('demo_categories', JSON.stringify(appState.categories));
                    showToast("Category added successfully!");
                }
                closeCategoryModal();
                refreshAllUI();
            } else {
                let dbPromise;
                if (id) {
                    dbPromise = fbStore.collection('categories').doc(id).update(catData);
                } else {
                    const newId = 'cat_' + Date.now();
                    dbPromise = fbStore.collection('categories').doc(newId).set(catData);
                }
                dbPromise.then(() => {
                    showToast(id ? "Category updated in Cloud." : "Category created in Cloud.");
                    closeCategoryModal();
                    refreshAllUI();
                }).catch(err => showToast(err.message, "error"));
            }
        });
    }

    const renderCategoriesList = () => {
        if (!adminCategoryListTbody) return;
        adminCategoryListTbody.innerHTML = '';
        
        const searchInput = document.getElementById('category-search-input');
        const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        let filtered = appState.categories || [];
        if (searchVal) {
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(searchVal) || 
                c.desc.toLowerCase().includes(searchVal)
            );
        }
        
        if (filtered.length === 0) {
            adminCategoryListTbody.innerHTML = `<tr><td colspan="6" class="empty-state-row text-center py-8 text-stone-400" style="padding:24px; text-align:center; color:#999;">No categories found.</td></tr>`;
            return;
        }
        
        filtered.forEach((cat, index) => {
            const tr = document.createElement('tr');
            const displayId = index + 10; // Start at 10 to match screenshot exactly!
            
            tr.innerHTML = `
                <td class="font-bold text-gray-700">${displayId}</td>
                <td><strong>${cat.title}</strong></td>
                <td class="text-stone-500 text-xs">${cat.desc}</td>
                <td><img src="${cat.imgUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=150&q=80'}" class="w-12 h-12 object-cover rounded border border-gray-200" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border:1px solid #eee;"></td>
                <td class="text-stone-400 text-xs">${cat.createdAt || '2025-10-13 06:00:00'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="edit-btn px-3 py-1 bg-[#3b82f6] hover:bg-blue-700 text-white font-semibold text-xs rounded transition duration-150 cursor-pointer" style="border: none; background:#3b82f6; padding: 4px 10px; color:#fff; border-radius: 4px; font-size:11px; font-weight:600; cursor:pointer;">Edit</button>
                        <button class="delete-btn px-3 py-1 bg-[#ef4444] hover:bg-red-700 text-white font-semibold text-xs rounded transition duration-150 cursor-pointer" style="border: none; background:#ef4444; padding: 4px 10px; color:#fff; border-radius: 4px; font-size:11px; font-weight:600; cursor:pointer;">Delete</button>
                    </div>
                </td>
            `;
            
            tr.querySelector('.edit-btn').addEventListener('click', () => editCategory(cat.id));
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteCategory(cat.id));
            adminCategoryListTbody.appendChild(tr);
        });
    };

    const editCategory = (id) => {
        const cat = appState.categories.find(c => c.id === id);
        if (!cat) return;
        
        document.getElementById('category-modal-title').textContent = "Edit Category Details";
        document.getElementById('category-id-hidden').value = cat.id;
        document.getElementById('cat-title').value = cat.title;
        document.getElementById('cat-desc').value = cat.desc;
        resetCategoryUploader(cat.imgUrl);
        adminCategoryModal.classList.remove('hidden');
    };

    const deleteCategory = (id) => {
        const confirmDel = confirm("Are you sure you want to delete this category? Any gallery images in this category will stay, but the filter tag will be removed.");
        if (!confirmDel) return;
        
        if (appState.dbType === 'demo') {
            appState.categories = appState.categories.filter(c => c.id !== id);
            localStorage.setItem('demo_categories', JSON.stringify(appState.categories));
            showToast("Category deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('categories').doc(id).delete()
                .then(() => {
                    showToast("Category deleted from Cloud.");
                    refreshAllUI();
                })
                .catch(err => showToast(err.message, "error"));
        }
    };

    const catSearchInput = document.getElementById('category-search-input');
    if (catSearchInput) {
        if (catSearchInput) catSearchInput.addEventListener('input', renderCategoriesList);
    }

    window.printCategoryList = () => {
        window.print();
    };
    const printCatsBtn = document.getElementById('print-categories-btn');
    if (printCatsBtn) {
        if (printCatsBtn) printCatsBtn.addEventListener('click', () => window.printCategoryList());
    }

    // =========================================================================
    // 9. SOCIAL MEDIA STREAMING VIDEO MANAGER CONTROLLER
    // =========================================================================

    const adminAddMediaBtn = document.getElementById('admin-add-media-btn');
    const adminMediaModal = document.getElementById('admin-media-modal');
    const adminMediaForm = document.getElementById('admin-media-form');
    const closeMediaModalBtn = document.getElementById('close-media-modal-btn');
    const cancelMediaModalBtn = document.getElementById('cancel-media-modal-btn');
    const mediaSearchInput = document.getElementById('media-search-input');
    const printMediaBtn = document.getElementById('print-media-btn');
    const adminMediaListTbody = document.getElementById('admin-media-list-tbody');
    
    const mediaPlatformSelect = document.getElementById('media-platform');
    const mediaTitleInput = document.getElementById('media-title');
    const mediaUrlInput = document.getElementById('media-url');
    const mediaEnabledCheckbox = document.getElementById('media-enabled');
    const mediaIdHidden = document.getElementById('media-id-hidden');
    const mediaModalTitle = document.getElementById('media-modal-title');

    // Helper: Parse YouTube direct links into embed urls
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            videoId = match[2];
        } else if (url.includes('/shorts/')) {
            const parts = url.split('/shorts/');
            if (parts.length > 1) {
                videoId = parts[1].split(/[?#&]/)[0];
            }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    };

    // Helper: Parse Instagram post/reel urls into embed urls
    const getInstagramEmbedUrl = (url) => {
        if (!url) return '';
        let cleanUrl = url.split(/[?#]/)[0];
        if (!cleanUrl.endsWith('/')) {
            cleanUrl += '/';
        }
        return cleanUrl + 'embed/';
    };

    // Open Add Modal
    if (adminAddMediaBtn) {
        if (adminAddMediaBtn) adminAddMediaBtn.addEventListener('click', () => {
            if (mediaModalTitle) mediaModalTitle.textContent = "Add Video / Reel Link";
            if (adminMediaForm) adminMediaForm.reset();
            if (mediaIdHidden) mediaIdHidden.value = '';
            if (adminMediaModal) adminMediaModal.classList.remove('hidden');
        });
    }

    const closeMediaModal = () => {
        if (adminMediaModal) adminMediaModal.classList.add('hidden');
    };
    if (closeMediaModalBtn) if (closeMediaModalBtn) closeMediaModalBtn.addEventListener('click', closeMediaModal);
    if (cancelMediaModalBtn) if (cancelMediaModalBtn) cancelMediaModalBtn.addEventListener('click', closeMediaModal);

    // Save/Update media item
    if (adminMediaForm) {
        if (adminMediaForm) adminMediaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const platform = mediaPlatformSelect.value;
            const title = mediaTitleInput.value.trim();
            const rawUrl = mediaUrlInput.value.trim();
            const enabled = mediaEnabledCheckbox.checked;
            const id = mediaIdHidden.value;

            // Generate embeds
            let embedUrl = '';
            if (platform === 'youtube') {
                embedUrl = getYouTubeEmbedUrl(rawUrl);
                if (!embedUrl) {
                    showToast("Invalid YouTube URL. Please copy a correct YouTube video link.", "error");
                    return;
                }
            } else {
                embedUrl = getInstagramEmbedUrl(rawUrl);
                if (!embedUrl || !rawUrl.includes('instagram.com')) {
                    showToast("Invalid Instagram URL. Please paste a correct Instagram post/reel link.", "error");
                    return;
                }
            }

            const mediaData = {
                id: id || 'med_' + Date.now(),
                type: platform,
                title: title,
                url: rawUrl,
                embedUrl: embedUrl,
                enabled: enabled,
                createdAt: id ? (appState.mediaItems.find(m => m.id === id)?.createdAt || formatToday()) : formatToday()
            };

            if (appState.dbType === 'demo') {
                if (id) {
                    const idx = appState.mediaItems.findIndex(m => m.id === id);
                    if (idx !== -1) appState.mediaItems[idx] = mediaData;
                } else {
                    appState.mediaItems.push(mediaData);
                }
                localStorage.setItem('demo_media_items', JSON.stringify(appState.mediaItems));
                showToast("Media link saved successfully!");
                closeMediaModal();
                refreshAllUI();
            } else {
                // Cloud DB sync
                fbStore.collection('media_items').doc(mediaData.id).set(mediaData)
                    .then(() => {
                        showToast("Media link synced to cloud!");
                        closeMediaModal();
                        refreshAllUI();
                    })
                    .catch(err => showToast(err.message, "error"));
            }
        });
    }

    // Render Admin List Table
    const renderAdminMedia = () => {
        if (!adminMediaListTbody) return;
        adminMediaListTbody.innerHTML = '';

        const searchVal = mediaSearchInput ? mediaSearchInput.value.toLowerCase().trim() : '';

        const filtered = appState.mediaItems.filter(item => {
            return item.title.toLowerCase().includes(searchVal) || item.url.toLowerCase().includes(searchVal);
        });

        if (filtered.length === 0) {
            adminMediaListTbody.innerHTML = `<tr><td colspan="6" class="empty-state-row text-center py-8 text-stone-400" style="padding:24px; text-align:center; color:#999;">No media links found.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const statusClass = item.enabled ? 'converted' : 'cancelled';
            const statusLabel = item.enabled ? 'Published' : 'Hidden';

            tr.innerHTML = `
                <td>
                    <span class="status-pill ${item.type === 'youtube' ? 'youtube' : 'instagram'}" style="background:${item.type === 'youtube' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(236, 72, 153, 0.1)'}; color:${item.type === 'youtube' ? '#ef4444' : '#ec4899'}; border:1px solid ${item.type === 'youtube' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 72, 153, 0.2)'}; text-transform:uppercase; font-size:10px; font-weight:700; padding:3px 8px; border-radius:3px;">
                        ${item.type}
                    </span>
                </td>
                <td><strong>${item.title}</strong></td>
                <td><a href="${item.url}" target="_blank" class="text-blue-500 hover:underline text-xs" style="color:#3b82f6;">Link <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px;"></i></a></td>
                <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                <td class="text-stone-400 text-xs">${item.createdAt || '2026-07-26 18:00:00'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="edit-btn px-3 py-1 bg-[#3b82f6] hover:bg-blue-700 text-white font-semibold text-xs rounded transition duration-150 cursor-pointer" style="border: none; background:#3b82f6; padding: 4px 10px; color:#fff; border-radius: 4px; font-size:11px; font-weight:600; cursor:pointer;">Edit</button>
                        <button class="delete-btn px-3 py-1 bg-[#ef4444] hover:bg-red-700 text-white font-semibold text-xs rounded transition duration-150 cursor-pointer" style="border: none; background:#ef4444; padding: 4px 10px; color:#fff; border-radius: 4px; font-size:11px; font-weight:600; cursor:pointer;">Delete</button>
                    </div>
                </td>
            `;

            tr.querySelector('.edit-btn').addEventListener('click', () => editMediaItem(item.id));
            tr.querySelector('.delete-btn').addEventListener('click', () => deleteMediaItem(item.id));
            adminMediaListTbody.appendChild(tr);
        });
    };

    const editMediaItem = (id) => {
        const item = appState.mediaItems.find(m => m.id === id);
        if (!item) return;

        if (mediaModalTitle) mediaModalTitle.textContent = "Edit Video / Reel Details";
        if (mediaIdHidden) mediaIdHidden.value = item.id;
        if (mediaPlatformSelect) mediaPlatformSelect.value = item.type;
        if (mediaTitleInput) mediaTitleInput.value = item.title;
        if (mediaUrlInput) mediaUrlInput.value = item.url;
        if (mediaEnabledCheckbox) mediaEnabledCheckbox.checked = item.enabled;

        if (adminMediaModal) adminMediaModal.classList.remove('hidden');
    };

    const deleteMediaItem = (id) => {
        const confirmDel = confirm("Are you sure you want to delete this media streaming link from your website?");
        if (!confirmDel) return;

        if (appState.dbType === 'demo') {
            appState.mediaItems = appState.mediaItems.filter(m => m.id !== id);
            localStorage.setItem('demo_media_items', JSON.stringify(appState.mediaItems));
            showToast("Media link deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('media_items').doc(id).delete()
                .then(() => {
                    showToast("Media link deleted from Cloud.");
                    refreshAllUI();
                })
                .catch(err => showToast(err.message, "error"));
        }
    };

    if (mediaSearchInput) {
        if (mediaSearchInput) mediaSearchInput.addEventListener('input', renderAdminMedia);
    }
    if (printMediaBtn) {
        if (printMediaBtn) printMediaBtn.addEventListener('click', () => window.print());
    }

    // YouTube Video ID Extractor
    const getYouTubeVideoId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        } else if (url.includes('/shorts/')) {
            const parts = url.split('/shorts/');
            if (parts.length > 1) {
                return parts[1].split(/[?#&]/)[0];
            }
        }
        return '';
    };

    // Global video players triggers
    window.playYouTubeVideo = (container, videoId) => {
        container.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" class="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        `;
    };

    window.playInstagramVideo = (container, embedUrl) => {
        container.innerHTML = `
            <iframe src="${embedUrl}" class="absolute top-0 left-0 w-full h-full border-0" scrolling="no" allowtransparency="true" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        `;
    };

    // Render Public Media Section (Fluid Grid streaming directly from source)
    const renderPublicMedia = () => {
        const ytGrid = document.getElementById('pub-media-youtube-grid');
        const igGrid = document.getElementById('pub-media-instagram-grid');

        if (ytGrid) ytGrid.innerHTML = '';
        if (igGrid) igGrid.innerHTML = '';

        const activeItems = appState.mediaItems.filter(m => m.enabled !== false);

        let ytCount = 0;
        let igCount = 0;

        activeItems.forEach(item => {
            if (item.type === 'youtube') {
                ytCount++;
                if (ytGrid) {
                    const videoId = getYouTubeVideoId(item.url);
                    const card = document.createElement('div');
                    card.className = "bg-stone-950 border border-gold-500/10 rounded-sm overflow-hidden flex flex-col h-full shadow-lg transition duration-300 hover:border-gold-500/30 group";
                    card.innerHTML = `
                        <div class="relative pb-[56.25%] h-0 overflow-hidden bg-black cursor-pointer group" onclick="window.openVideoLightbox('${videoId}', \`${item.title.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                            <img src="https://img.youtube.com/vi/${videoId}/sddefault.jpg" class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="${item.title}" loading="lazy">
                            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <div class="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-600">
                                    <i class="fa-solid fa-play text-xl ml-0.5"></i>
                                </div>
                            </div>
                        </div>
                        <div class="p-5 flex-grow">
                            <h4 class="font-serif text-sm font-bold text-white mb-2 line-clamp-2">${item.title}</h4>
                            <span class="text-[9px] uppercase tracking-widest text-red-500 font-bold flex items-center gap-1"><i class="fa-brands fa-youtube"></i> Streaming YouTube</span>
                        </div>
                    `;
                    ytGrid.appendChild(card);
                }
            } else if (item.type === 'instagram') {
                igCount++;
                if (igGrid) {
                    const card = document.createElement('div');
                    card.className = "bg-stone-950 border border-gold-500/10 rounded-sm overflow-hidden flex flex-col h-full shadow-lg transition duration-300 hover:border-gold-500/30 group";
                    card.innerHTML = `
                        <div class="relative cursor-pointer" style="padding-top: 120%; height: 0; overflow: hidden; bg-black;" onclick="window.playInstagramVideo(this, '${item.embedUrl}')">
                            <div class="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-6 text-center">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-4">
                                    <i class="fa-brands fa-instagram text-2xl"></i>
                                </div>
                                <p class="text-stone-300 text-xs font-medium uppercase tracking-wider mb-1 px-4">${item.title}</p>
                                <span class="text-[9px] text-stone-500 uppercase tracking-widest">Click to View Reel</span>
                            </div>
                        </div>
                        <div class="p-5 flex-grow">
                            <h4 class="font-serif text-sm font-bold text-white mb-2 line-clamp-2">${item.title}</h4>
                            <span class="text-[9px] uppercase tracking-widest text-pink-500 font-bold flex items-center gap-1"><i class="fa-brands fa-instagram"></i> Streaming Instagram</span>
                        </div>
                    `;
                    igGrid.appendChild(card);
                }
            }
        });

        // Safe fallback descriptions
        if (ytCount === 0 && ytGrid) {
            ytGrid.innerHTML = `<p class="text-stone-500 text-center py-10 col-span-2 text-xs">No YouTube showcase videos uploaded yet.</p>`;
        }
        if (igCount === 0 && igGrid) {
            igGrid.innerHTML = `<p class="text-stone-500 text-center py-10 col-span-3 text-xs">No Instagram reels or posts linked yet.</p>`;
        }
    };

    window.switchPublicMediaTab = (platform) => {
        const ytTabBtn = document.getElementById('pub-media-tab-youtube');
        const igTabBtn = document.getElementById('pub-media-tab-instagram');
        const ytGrid = document.getElementById('pub-media-youtube-grid');
        const igGrid = document.getElementById('pub-media-instagram-grid');

        if (platform === 'youtube') {
            if (ytTabBtn) {
                ytTabBtn.classList.remove('border-transparent', 'text-stone-400');
                ytTabBtn.classList.add('border-gold-400', 'text-white');
            }
            if (igTabBtn) {
                igTabBtn.classList.remove('border-gold-400', 'text-white');
                igTabBtn.classList.add('border-transparent', 'text-stone-400');
            }
            if (ytGrid) ytGrid.classList.remove('hidden');
            if (igGrid) igGrid.classList.add('hidden');
        } else {
            if (igTabBtn) {
                igTabBtn.classList.remove('border-transparent', 'text-stone-400');
                igTabBtn.classList.add('border-gold-400', 'text-white');
            }
            if (ytTabBtn) {
                ytTabBtn.classList.remove('border-gold-400', 'text-white');
                ytTabBtn.classList.add('border-transparent', 'text-stone-400');
            }
            if (igGrid) igGrid.classList.remove('hidden');
            if (ytGrid) ytGrid.classList.add('hidden');
        }
    };

    const renderPublicGallery = () => {
        if (!publicGalleryGrid) return;
        publicGalleryGrid.innerHTML = '';
        
        // Render filter buttons dynamically
        const filtersContainer = document.getElementById('public-gallery-filters');
        if (filtersContainer) {
            filtersContainer.innerHTML = '';
            
            // "All Photos" button
            const allBtn = document.createElement('button');
            allBtn.className = "gallery-tab-btn px-5 py-2 bg-stone-900 border border-gold-500/10 rounded-sm text-xs font-semibold uppercase tracking-wider text-stone-300 hover:bg-gold-500 hover:text-stone-950 transition duration-300 active";
            allBtn.setAttribute('data-filter', 'all');
            allBtn.textContent = 'All Photos';
            filtersContainer.appendChild(allBtn);
            
            // Category specific buttons
            (appState.categories || []).forEach(cat => {
                const btn = document.createElement('button');
                btn.className = "gallery-tab-btn px-5 py-2 bg-stone-900 border border-gold-500/10 rounded-sm text-xs font-semibold uppercase tracking-wider text-stone-300 hover:bg-gold-500 hover:text-stone-950 transition duration-300";
                btn.setAttribute('data-filter', cat.id);
                btn.textContent = cat.title;
                filtersContainer.appendChild(btn);
            });
        }
        
        if (appState.gallery.length === 0) {
            publicGalleryGrid.innerHTML = `<p class="text-center text-stone-500 py-10 w-full col-span-3">No images published yet.</p>`;
            return;
        }

        appState.gallery.forEach(img => {
            const card = document.createElement('div');
            card.className = "gallery-item-card relative overflow-hidden group rounded-sm border border-gold-500/10 hover:border-gold-500/30 transition-all duration-500 cursor-pointer";
            card.setAttribute('data-category', img.category);
            
            // Find category title for display label, e.g. "Wedding Shoot"
            const catObj = appState.categories.find(c => c.id === img.category);
            const categoryLabel = catObj ? catObj.title : img.category;
            
            card.innerHTML = `
                <img src="${img.url}" alt="${img.title}" class="w-full h-40 sm:h-56 md:h-72 object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-4 md:p-6 z-10">
                    <span class="text-gold-400 text-[9px] uppercase tracking-widest font-bold">${categoryLabel}</span>
                    <h4 class="font-serif text-sm md:text-lg text-white font-bold mt-1">${img.title}</h4>
                    <p class="text-stone-300 text-[10px] md:text-xs mt-1 font-light leading-relaxed line-clamp-2 md:line-clamp-none">${img.desc}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                window.openLightbox(img.url, img.title, img.desc);
            });
            publicGalleryGrid.appendChild(card);
        });

        // Re-bind dynamic public filter triggers
        if (filtersContainer) {
            const tabBtns = filtersContainer.querySelectorAll('.gallery-tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const filter = btn.getAttribute('data-filter');
                    const cards = publicGalleryGrid.querySelectorAll('.gallery-item-card');
                    cards.forEach(card => {
                        if (filter === 'all' || card.getAttribute('data-category') === filter) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    // Dynamic Gallery CTA Conversion Flow
                    const ctaBanner = document.getElementById('gallery-cta-banner');
                    const ctaText = document.getElementById('gallery-cta-text');
                    const ctaBtn = document.getElementById('gallery-cta-btn');
                    
                    const ctaMap = {
                        'wedding': {
                            text: 'Interested in Wedding Photography?',
                            btnText: 'Enquire for Wedding',
                            selectValue: 'Wedding Photography'
                        },
                        'prewedding': {
                            text: 'Interested in a Pre-Wedding Shoot?',
                            btnText: 'Enquire for Pre-Wedding',
                            selectValue: 'Pre-Wedding Shoot'
                        },
                        'engagement': {
                            text: 'Planning Your Engagement?',
                            btnText: 'Enquire for Engagement',
                            selectValue: 'Engagement Shoot'
                        },
                        'birthday': {
                            text: 'Love Natural Moments?',
                            btnText: 'Enquire for Candid',
                            selectValue: 'Anniversary / Birthday'
                        },
                        'maternity': {
                            text: 'Capture Beautiful Memories',
                            btnText: 'Enquire for Maternity',
                            selectValue: 'Maternity / Baby Shower'
                        }
                    };

                    const matched = ctaMap[filter];
                    if (matched && ctaBanner && ctaText && ctaBtn) {
                        ctaText.textContent = matched.text;
                        ctaBtn.textContent = matched.btnText;
                        ctaBanner.classList.remove('hidden');
                        
                        ctaBtn.onclick = (e) => {
                            e.preventDefault();
                            
                            // Smooth scroll to the contact form section
                            window.showPublicSection('contact');
                            
                            // Auto select matching option
                            const enqSelect = document.getElementById('enq-event-type');
                            if (enqSelect) {
                                enqSelect.value = matched.selectValue;
                                
                                // Focus and highlight select element with dynamic ring effect
                                enqSelect.focus();
                                enqSelect.classList.add('ring-2', 'ring-gold-500', 'border-gold-500', 'scale-102');
                                setTimeout(() => {
                                    enqSelect.classList.remove('ring-2', 'ring-gold-500', 'border-gold-500', 'scale-102');
                                }, 1500);
                            }
                        };
                    } else if (ctaBanner) {
                        ctaBanner.classList.add('hidden');
                    }
                });
            });
        }
    };

    // =========================================================================
    // NEW: MANAGE BLOG ARTICLES CONTROLLER
    // =========================================================================

    if (adminAddBlogBtn) adminAddBlogBtn.addEventListener('click', () => {
        document.getElementById('blog-modal-title').textContent = "Write Blog Post";
        adminBlogForm.reset();
        document.getElementById('blog-id-hidden').value = '';
        document.getElementById('blog-date').value = formatToday();
        adminBlogModal.classList.remove('hidden');
    });

    const closeBlogModal = () => {
        adminBlogModal.classList.add('hidden');
    };
    if (closeBlogModalBtn) closeBlogModalBtn.addEventListener('click', closeBlogModal);
    if (cancelBlogModalBtn) cancelBlogModalBtn.addEventListener('click', closeBlogModal);

    if (adminBlogForm) adminBlogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id-hidden').value;
        const title = document.getElementById('blog-title').value.trim();
        const cover = document.getElementById('blog-cover').value.trim();
        const excerpt = document.getElementById('blog-excerpt').value.trim();
        const content = document.getElementById('blog-content').value.trim();
        const author = document.getElementById('blog-author').value.trim() || 'Studio Director';
        const date = document.getElementById('blog-date').value;

        const blogData = { title, cover, excerpt, content, author, date };

        if (appState.dbType === 'demo') {
            if (id) {
                const idx = appState.blog.findIndex(b => b.id === id);
                if (idx !== -1) {
                    appState.blog[idx] = { id, ...blogData };
                    localStorage.setItem('demo_blog', JSON.stringify(appState.blog));
                    showToast("Blog post updated!");
                }
            } else {
                const newId = 'blog_' + Date.now();
                appState.blog.push({ id: newId, ...blogData });
                localStorage.setItem('demo_blog', JSON.stringify(appState.blog));
                showToast("Blog post published!");
            }
            closeBlogModal();
            refreshAllUI();
        } else {
            let dbPromise;
            if (id) {
                dbPromise = fbStore.collection('blog').doc(id).update(blogData);
            } else {
                const newId = 'blog_' + Date.now();
                dbPromise = fbStore.collection('blog').doc(newId).set({ id: newId, ...blogData });
            }
            dbPromise.then(() => {
                showToast("Article published to cloud!");
                closeBlogModal();
            }).catch(err => showToast(err.message, "error"));
        }
    });

    const renderAdminBlog = () => {
        adminBlogListTbody.innerHTML = '';
        if (appState.blog.length === 0) {
            adminBlogListTbody.innerHTML = `<tr><td colspan="6" class="empty-state-row">No blog posts drafted yet.</td></tr>`;
            return;
        }
        appState.blog.forEach(article => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${article.cover}" class="w-12 h-8 object-cover rounded border border-gold-500/20"></td>
                <td><strong>${article.title}</strong></td>
                <td>${article.author}</td>
                <td>${new Date(article.date).toLocaleDateString('en-IN')}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size:11px;" class="text-muted">${article.excerpt}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn edit" title="Edit Article" data-id="${article.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="table-action-btn delete" title="Delete Article" data-id="${article.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            tr.querySelector('.edit').addEventListener('click', () => editBlogArticle(article.id));
            tr.querySelector('.delete').addEventListener('click', () => deleteBlogArticle(article.id));
            adminBlogListTbody.appendChild(tr);
        });
    };

    const editBlogArticle = (id) => {
        const article = appState.blog.find(b => b.id === id);
        if (!article) return;
        document.getElementById('blog-modal-title').textContent = "Edit Blog Post";
        document.getElementById('blog-id-hidden').value = article.id;
        document.getElementById('blog-title').value = article.title;
        document.getElementById('blog-cover').value = article.cover;
        document.getElementById('blog-excerpt').value = article.excerpt;
        document.getElementById('blog-content').value = article.content;
        document.getElementById('blog-author').value = article.author || 'Studio Admin';
        document.getElementById('blog-date').value = article.date;
        adminBlogModal.classList.remove('hidden');
    };

    const deleteBlogArticle = (id) => {
        const confirmDel = confirm("Are you sure you want to delete this blog post from your website?");
        if (!confirmDel) return;
        if (appState.dbType === 'demo') {
            appState.blog = appState.blog.filter(b => b.id !== id);
            localStorage.setItem('demo_blog', JSON.stringify(appState.blog));
            showToast("Blog article deleted.");
            refreshAllUI();
        } else {
            fbStore.collection('blog').doc(id).delete()
                .then(() => showToast("Deleted from cloud."))
                .catch(err => showToast(err.message, "error"));
        }
    };

    const renderPublicBlog = () => {
        if (!publicBlogGrid) return;
        publicBlogGrid.innerHTML = '';

        if (appState.blog.length === 0) {
            publicBlogGrid.innerHTML = `<p class="text-center text-stone-500 py-10 w-full col-span-3">No articles published yet.</p>`;
            return;
        }

        appState.blog.forEach(article => {
            const card = document.createElement('article');
            card.className = "bg-stone-900 border border-gold-500/10 rounded-sm overflow-hidden hover:border-gold-500/30 transition duration-300 flex flex-col group";
            card.innerHTML = `
                <div class="relative overflow-hidden h-48">
                    <img src="${article.cover}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                    <span class="absolute bottom-4 left-4 px-2 py-0.5 bg-black/80 backdrop-blur text-gold-400 text-[9px] uppercase tracking-wider font-semibold border border-gold-500/20">${new Date(article.date).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h4 class="font-serif text-lg font-bold text-white mb-2 leading-snug group-hover:text-gold-400 transition">${article.title}</h4>
                    <p class="text-stone-400 text-xs font-light leading-relaxed mb-6 flex-grow">${article.excerpt}</p>
                    <div class="flex items-center justify-between border-t border-gold-500/5 pt-4">
                        <span class="text-[9px] uppercase tracking-wider text-stone-500 font-bold"><i class="fa-solid fa-user-edit text-gold-500/60 mr-1"></i> By ${article.author}</span>
                        <button onclick="readFullBlog('${article.id}')" class="text-gold-400 hover:text-gold-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 focus:outline-none">Read Full <i class="fa-solid fa-arrow-right-long"></i></button>
                    </div>
                </div>
            `;
            publicBlogGrid.appendChild(card);
        });
    };

    // Public Blog view modal details
    window.readFullBlog = (id) => {
        const article = appState.blog.find(b => b.id === id);
        if (!article) return;
        alert(`\n📖 [${article.title}]\n\nBy ${article.author} - published on ${article.date}\n\n${article.content}\n`);
    };

    // Dynamic services/packages rendering on public site
    const renderPublicServices = () => {
        if (!publicServicesGrid) return;
        publicServicesGrid.innerHTML = '';
        
        const activeServices = appState.services.filter(s => s.enabled);
        if (activeServices.length === 0) {
            publicServicesGrid.innerHTML = `<p class="text-center text-stone-500 py-10 w-full col-span-3">No photoshoot packages configured.</p>`;
            return;
        }

        activeServices.forEach(srv => {
            const card = document.createElement('div');
            card.className = "bg-stone-900/60 border border-gold-500/10 p-8 rounded-sm hover:border-gold-500/30 hover:-translate-y-1 transition duration-300 relative group flex flex-col items-center text-center shadow-lg";
            
            // Map icon or custom icon
            const cleanIcon = srv.icon ? (srv.icon.startsWith('fa-') ? srv.icon : 'fa-' + srv.icon) : 'fa-camera';
            
            card.innerHTML = `
                <div class="w-14 h-14 bg-stone-950 border border-gold-500/20 text-gold-400 rounded-full flex items-center justify-center text-2xl group-hover:bg-gradient-to-r group-hover:from-gold-600 group-hover:to-gold-400 group-hover:text-stone-950 transition duration-300">
                    <i class="fa-solid ${cleanIcon}"></i>
                </div>
                <h3 class="font-serif text-lg font-bold text-white mt-6">${srv.name}</h3>
                <p class="text-stone-400 text-xs mt-3 leading-relaxed font-light">Custom luxury shoot styled with premium layout sets and high-fidelity captures.</p>
                <div class="text-gold-400 text-sm font-bold tracking-widest mt-6 font-sans">Starting from ₹${srv.basePrice.toLocaleString('en-IN')}</div>
                <a href="#contact" class="mt-6 px-5 py-2.5 bg-stone-950 hover:bg-stone-800 border border-gold-500/20 text-gold-400 text-[10px] font-bold uppercase tracking-widest rounded-sm transition duration-300" onclick="document.getElementById('sec-contact').scrollIntoView({behavior:'smooth'})">Enquire Shoot</a>
            `;
            publicServicesGrid.appendChild(card);
        });
    };

    // =========================================================================
    // INTERACTIVE ESTIMATOR WIDGET (Public CTA helper)
    // =========================================================================
    window.openPricingEstimator = () => {
        const container = document.getElementById('estimator-items-list');
        if (!container) return;
        container.innerHTML = '';

        const activeServices = appState.services.filter(s => s.enabled);
        activeServices.forEach(srv => {
            const row = document.createElement('label');
            row.className = "flex items-center justify-between p-3 bg-stone-950 border border-gold-500/5 hover:border-gold-500/20 rounded cursor-pointer transition select-none mb-1.5";
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" class="estimator-chk accent-gold-500 h-4 w-4" data-id="${srv.id}" data-price="${srv.basePrice}" onchange="recalculateEstimatorTotal()">
                    <div>
                        <span class="text-stone-200 text-xs font-semibold block">${srv.name}</span>
                        <span class="text-stone-500 text-[10px]">Package base rate</span>
                    </div>
                </div>
                <span class="text-gold-400 text-xs font-bold font-serif">₹${srv.basePrice.toLocaleString('en-IN')}</span>
            `;
            container.appendChild(row);
        });

        document.getElementById('estimator-total-val').textContent = '₹0';
        document.getElementById('pricing-estimator-modal').classList.remove('hidden');
    };

    window.closePricingEstimator = () => {
        document.getElementById('pricing-estimator-modal').classList.add('hidden');
    };

    window.recalculateEstimatorTotal = () => {
        let total = 0;
        const chks = document.querySelectorAll('.estimator-chk:checked');
        chks.forEach(chk => {
            total += parseFloat(chk.getAttribute('data-price')) || 0;
        });
        document.getElementById('estimator-total-val').textContent = `₹${total.toLocaleString('en-IN')}`;
    };

    window.submitEstimatorToContact = () => {
        const chks = document.querySelectorAll('.estimator-chk:checked');
        if (chks.length === 0) {
            alert("Please check at least one photoshoot package.");
            return;
        }

        const selectedNames = [];
        chks.forEach(chk => {
            const srvId = chk.getAttribute('data-id');
            const srv = appState.services.find(s => s.id === srvId);
            if (srv) selectedNames.push(srv.name);
        });

        closePricingEstimator();
        window.showPublicSection('contact');

        // Pre-fill enquiry fields
        const selectBox = document.getElementById('enq-event-type');
        if (selectBox) {
            // Select matching event or put custom message
            const first = selectedNames[0];
            let found = false;
            for (let i = 0; i < selectBox.options.length; i++) {
                if (selectBox.options[i].value === first) {
                    selectBox.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                // select Custom/Other if present or first
                selectBox.selectedIndex = 0;
            }
        }

        const msgBox = document.getElementById('enq-msg');
        if (msgBox) {
            msgBox.value = `Estimated services checklist: ${selectedNames.join(', ')}. Subtotal estimated: ${document.getElementById('estimator-total-val').textContent}. Please connect with us!`;
        }

        showToast("Estimator config pre-filled! Please enter contact info.");
    };

    // =========================================================================
    // 9. CLIENT PUBLIC ENQUIRIES CONTROLLER
    // =========================================================================
    
    const renderEnquiriesList = () => {
        enquiriesListTbody.innerHTML = '';

        const pendingEnqs = appState.enquiries.filter(e => e.status === 'Pending');
        
        // Sync badge on sidebar
        if (pendingEnqs.length > 0) {
            sidebarEnqBadge.textContent = pendingEnqs.length;
            sidebarEnqBadge.classList.remove('hidden');
        } else {
            sidebarEnqBadge.classList.add('hidden');
        }

        if (appState.enquiries.length === 0) {
            enquiriesListTbody.innerHTML = `<tr><td colspan="7" class="empty-state-row">No public enquiries sent from the website yet.</td></tr>`;
            return;
        }

        appState.enquiries.forEach(enq => {
            const tr = document.createElement('tr');
            
            const eventDateStr = new Date(enq.eventDate).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            tr.innerHTML = `
                <td><strong>${enq.name}</strong></td>
                <td>${enq.mobile}</td>
                <td>${eventDateStr}</td>
                <td><span class="status-pill converted">${enq.eventType}</span></td>
                <td>${enq.eventLocation || '<span class="text-muted">N/A</span>'}</td>
                <td style="max-width:200px; font-size:12px; color:var(--text-muted); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${enq.message || ''}</td>
                <td>
                    <div class="table-actions">
                        ${enq.status === 'Pending' ? `<button class="table-action-btn convert" title="Convert to Active Booking" data-id="${enq.id}"><i class="fa-solid fa-calendar-plus"></i></button>` : `<span class="status-pill completed">Converted</span>`}
                        <button class="table-action-btn delete" title="Delete Enquiry" data-id="${enq.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            const convertBtn = tr.querySelector('.convert');
            if (convertBtn) {
                convertBtn.addEventListener('click', () => convertEnquiryToBooking(enq.id));
            }

            tr.querySelector('.delete').addEventListener('click', () => deleteEnquiry(enq.id));

            enquiriesListTbody.appendChild(tr);
        });
    };

    const convertEnquiryToBooking = (id) => {
        const enq = appState.enquiries.find(e => e.id === id);
        if (!enq) return;

        // Step 1: Check if customer already exists. If not, auto-create customer.
        let customer = appState.customers.find(c => c.mobile === enq.mobile);
        
        const openWizard = (custObj) => {
            openDocumentWizard('Booking');
            
            // Prefill customer select
            docCustomerSelect.value = custObj.id;
            const event = new Event('change');
            docCustomerSelect.dispatchEvent(event);

            // Prefill event details
            docEventDateInput.value = enq.eventDate;
            docEventLocInput.value = enq.eventLocation || '';
            docEventDetailsInput.value = enq.message || '';
            
            // Mark which enquiry was source so we can clear/update it on save
            document.getElementById('doc-converted-from').value = `enq_${enq.id}`;

            // Try to match the event type with a default service rate
            const matchingService = appState.services.find(s => s.name.toLowerCase().includes(enq.eventType.toLowerCase()) || enq.eventType.toLowerCase().includes(s.name.toLowerCase()));
            
            docItemsTbody.innerHTML = '';
            if (matchingService) {
                addWizardItemRow({
                    serviceId: matchingService.id,
                    name: matchingService.name,
                    rate: matchingService.basePrice,
                    qty: 1
                });
            } else {
                addWizardItemRow({
                    serviceId: 'custom',
                    name: enq.eventType,
                    rate: 10000,
                    qty: 1
                });
            }

            calculateWizardTotals();
        };

        if (!customer) {
            const newCustId = 'cust_' + Date.now();
            const newCust = {
                id: newCustId,
                name: enq.name,
                mobile: enq.mobile,
                email: enq.email || '',
                address: enq.eventLocation || ''
            };

            if (appState.dbType === 'demo') {
                appState.customers.push(newCust);
                localStorage.setItem('demo_customers', JSON.stringify(appState.customers));
                refreshCustomersDropdown();
                openWizard(newCust);
            } else {
                fbStore.collection('customers').doc(newCustId).set(newCust)
                    .then(() => {
                        refreshCustomersDropdown();
                        openWizard(newCust);
                    });
            }
        } else {
            openWizard(customer);
        }
    };

    const deleteEnquiry = (id) => {
        const confirmDel = confirm("Are you sure you want to delete this enquiry request?");
        if (!confirmDel) return;

        if (appState.dbType === 'demo') {
            appState.enquiries = appState.enquiries.filter(e => e.id !== id);
            localStorage.setItem('demo_enquiries', JSON.stringify(appState.enquiries));
            showToast("Enquiry deleted.");
            renderEnquiriesList();
            renderDashboard();
        } else {
            fbStore.collection('enquiries').doc(id).delete()
                .then(() => showToast("Enquiry deleted from Cloud."))
                .catch(err => showToast("Failed to delete: " + err.message, "error"));
        }
    };

    // =========================================================================
    // 10. DOCUMENT BUILDER WIZARD (BOOKINGS, QUOTES, INVOICES)
    // =========================================================================
    
    // Quick Actions
    if (quickBookingBtn) if (quickBookingBtn) quickBookingBtn.addEventListener('click', () => openDocumentWizard('Booking'));
    if (quickInvoiceBtn) if (quickInvoiceBtn) quickInvoiceBtn.addEventListener('click', () => openDocumentWizard('Invoice'));

    const openDocumentWizard = (type, convertSource = null) => {
        docForm.reset();
        document.getElementById('doc-id-hidden').value = '';
        document.getElementById('doc-converted-from').value = convertSource || '';
        
        docTypeSelect.value = type;
        docDateInput.value = formatToday();
        docEventDateInput.value = formatToday();
        docEventLocInput.value = '';
        docSelectionStatus.value = 'Not Started';
        docEventDetailsInput.value = '';
        
        wizardCustPreview.classList.add('hidden');
        
        docItemsTbody.innerHTML = '';
        addWizardItemRow();

        // Extra pricing defaults
        wizExtraCharges.value = 0;
        wizDiscountInput.value = 0;
        wizTaxInput.value = 0;
        wizPaidAmountInput.value = 0;

        handleDocTypeUIFields(type);
        
        // Auto gen names
        docNumberInput.value = type === 'Invoice' ? generateInvoiceNum() : generateBookingNum();

        calculateWizardTotals();

        document.getElementById('doc-modal-title').textContent = convertSource ? `Convert Quotation to Invoice` : `Generate New ${type}`;
        docModal.classList.remove('hidden');
    };

    const handleDocTypeUIFields = (type) => {
        const invNumGroup = document.getElementById('doc-invoice-number-group');
        const payStatusGroup = document.getElementById('doc-payment-status-group');
        const payModeGroup = document.getElementById('doc-payment-mode-group');
        const partialPaidGroup = document.getElementById('doc-partial-paid-group');
        const selectStatusGroup = document.getElementById('doc-selection-status-group');

        if (type === 'Invoice') {
            invNumGroup.classList.remove('hidden');
            payStatusGroup.classList.remove('hidden');
            payModeGroup.classList.remove('hidden');
            selectStatusGroup.classList.add('hidden');
            handlePaymentStatusUIFields(docPaymentStatus.value);
        } else {
            invNumGroup.classList.add('hidden');
            payStatusGroup.classList.add('hidden');
            payModeGroup.classList.add('hidden');
            partialPaidGroup.classList.add('hidden');
            selectStatusGroup.classList.remove('hidden');
        }
    };

    const handlePaymentStatusUIFields = (status) => {
        const partialPaidGroup = document.getElementById('doc-partial-paid-group');
        const payModeGroup = document.getElementById('doc-payment-mode-group');
        
        if (status === 'Partial') {
            partialPaidGroup.classList.remove('hidden');
            payModeGroup.classList.remove('hidden');
        } else if (status === 'Paid') {
            partialPaidGroup.classList.add('hidden');
            payModeGroup.classList.remove('hidden');
        } else {
            partialPaidGroup.classList.add('hidden');
            payModeGroup.classList.add('hidden');
        }
    };

    if (docTypeSelect) docTypeSelect.addEventListener('change', () => {
        const type = docTypeSelect.value;
        handleDocTypeUIFields(type);
        docNumberInput.value = type === 'Invoice' ? generateInvoiceNum() : generateBookingNum();
        calculateWizardTotals();
    });

    if (docPaymentStatus) docPaymentStatus.addEventListener('change', () => {
        handlePaymentStatusUIFields(docPaymentStatus.value);
        calculateWizardTotals();
    });

    const closeDocModal = () => {
        docModal.classList.add('hidden');
    };
    if (closeDocModalBtn) closeDocModalBtn.addEventListener('click', closeDocModal);
    if (cancelDocModalBtn) cancelDocModalBtn.addEventListener('click', closeDocModal);

    const generateInvoiceNum = () => {
        const year = new Date().getFullYear();
        const count = appState.invoices.length + 1;
        return `INV-${year}-${String(count).padStart(4, '0')}`;
    };

    const generateBookingNum = () => {
        const year = new Date().getFullYear();
        const count = appState.quotations.length + 1;
        return `BK-${year}-${String(count).padStart(4, '0')}`;
    };

    const addWizardItemRow = (prefilled = null) => {
        const tr = document.createElement('tr');
        tr.className = 'wizard-item-row';
        
        let serviceOptionsHtml = '<option value="" disabled selected>-- Select Service --</option>';
        appState.services.forEach(srv => {
            if (srv.enabled) {
                serviceOptionsHtml += `<option value="${srv.id}" ${prefilled && prefilled.serviceId === srv.id ? 'selected' : ''}>${srv.name}</option>`;
            }
        });
        serviceOptionsHtml += `<option value="custom" ${prefilled && prefilled.serviceId === 'custom' ? 'selected' : ''}>-- Custom Addon --</option>`;

        tr.innerHTML = `
            <td>
                <select class="wiz-row-service-select">${serviceOptionsHtml}</select>
                <input type="text" class="wiz-row-custom-desc hidden mt-5" placeholder="Enter custom service details..." value="${prefilled && prefilled.serviceId === 'custom' ? prefilled.name : ''}">
            </td>
            <td><input type="number" class="wiz-row-rate" min="0" value="${prefilled ? prefilled.rate : '0'}"></td>
            <td><input type="number" class="wiz-row-qty" min="1" value="${prefilled ? prefilled.qty : '1'}"></td>
            <td><input type="text" class="wiz-row-total" value="₹0.00" disabled></td>
            <td class="text-center">
                <button type="button" class="delete-row-btn" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        const serviceSelect = tr.querySelector('.wiz-row-service-select');
        const customDescInput = tr.querySelector('.wiz-row-custom-desc');
        const rateInput = tr.querySelector('.wiz-row-rate');
        const qtyInput = tr.querySelector('.wiz-row-qty');
        const totalInput = tr.querySelector('.wiz-row-total');
        const deleteBtn = tr.querySelector('.delete-row-btn');

        const updateRowTotal = () => {
            const rate = parseFloat(rateInput.value) || 0;
            const qty = parseInt(qtyInput.value) || 1;
            totalInput.value = `₹${(rate * qty).toLocaleString('en-IN')}`;
            calculateWizardTotals();
        };

        serviceSelect.addEventListener('change', () => {
            const val = serviceSelect.value;
            if (val === 'custom') {
                customDescInput.classList.remove('hidden');
                rateInput.value = '0';
            } else {
                customDescInput.classList.add('hidden');
                const srv = appState.services.find(s => s.id === val);
                if (srv) rateInput.value = srv.basePrice;
            }
            updateRowTotal();
        });

        rateInput.addEventListener('input', updateRowTotal);
        qtyInput.addEventListener('input', updateRowTotal);
        
        deleteBtn.addEventListener('click', () => {
            if (docItemsTbody.querySelectorAll('tr').length > 1) {
                tr.remove();
                calculateWizardTotals();
            } else {
                showToast("Documents must contain at least one line item.", "error");
            }
        });

        docItemsTbody.appendChild(tr);
        
        if (prefilled) {
            if (prefilled.serviceId === 'custom') {
                customDescInput.classList.remove('hidden');
            }
            updateRowTotal();
        }
    };

    if (addItemRowBtn) addItemRowBtn.addEventListener('click', () => addWizardItemRow());

    const calculateWizardTotals = () => {
        let subtotal = 0;
        const rows = docItemsTbody.querySelectorAll('.wizard-item-row');
        
        rows.forEach(row => {
            const rate = parseFloat(row.querySelector('.wiz-row-rate').value) || 0;
            const qty = parseInt(row.querySelector('.wiz-row-qty').value) || 1;
            subtotal += (rate * qty);
        });

        const extraCharges = parseFloat(wizExtraCharges.value) || 0;
        const discountPercent = parseFloat(wizDiscountInput.value) || 0;
        const discountVal = (subtotal + extraCharges) * (discountPercent / 100);
        
        const taxable = (subtotal + extraCharges) - discountVal;
        const taxPercent = parseFloat(wizTaxInput.value) || 0;
        const taxVal = taxable * (taxPercent / 100);
        
        const grandTotal = taxable + taxVal;
        
        wizSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        wizExtraChargesVal.textContent = `+₹${extraCharges.toLocaleString('en-IN')}`;
        wizDiscountVal.textContent = `-₹${discountVal.toLocaleString('en-IN')}`;
        wizTaxVal.textContent = `+₹${taxVal.toLocaleString('en-IN')}`;
        wizGrandTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        const isInvoice = docTypeSelect.value === 'Invoice';
        const isPartial = docPaymentStatus.value === 'Partial';
        
        if (isInvoice && isPartial) {
            const paid = parseFloat(wizPaidAmountInput.value) || 0;
            const balance = grandTotal - paid;
            wizBalanceVal.textContent = `₹${balance.toLocaleString('en-IN')}`;
        }
    };

    if (wizExtraCharges) wizExtraCharges.addEventListener('input', calculateWizardTotals);
    if (wizDiscountInput) wizDiscountInput.addEventListener('input', calculateWizardTotals);
    if (wizTaxInput) wizTaxInput.addEventListener('input', calculateWizardTotals);
    if (wizPaidAmountInput) wizPaidAmountInput.addEventListener('input', calculateWizardTotals);

    // Save Booking Form Submissions
    if (docForm) docForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = docTypeSelect.value;
        const date = docDateInput.value;
        const eventDate = docEventDateInput.value;
        const eventLocation = docEventLocInput.value.trim();
        const eventDetails = docEventDetailsInput.value.trim();
        const selectionStatus = docSelectionStatus.value;
        const docId = document.getElementById('doc-id-hidden').value;
        const convertedFrom = document.getElementById('doc-converted-from').value;
        
        const customerId = docCustomerSelect.value;
        const customerDetails = appState.customers.find(c => c.id === customerId);

        if (!customerDetails) {
            showToast("Please select a valid customer.", "error");
            return;
        }

        const items = [];
        const rows = docItemsTbody.querySelectorAll('.wizard-item-row');
        let itemsValid = true;

        rows.forEach(row => {
            const srvSelect = row.querySelector('.wiz-row-service-select');
            const customInput = row.querySelector('.wiz-row-custom-desc');
            const rate = parseFloat(row.querySelector('.wiz-row-rate').value) || 0;
            const qty = parseInt(row.querySelector('.wiz-row-qty').value) || 1;

            if (!srvSelect.value) {
                itemsValid = false;
                return;
            }

            let name = "";
            let serviceId = srvSelect.value;

            if (serviceId === 'custom') {
                name = customInput.value.trim() || "Custom Addon shoot";
            } else {
                const srv = appState.services.find(s => s.id === serviceId);
                name = srv ? srv.name : "Photoshoot Service";
            }

            items.push({ serviceId, name, rate, qty, total: rate * qty });
        });

        if (!itemsValid || items.length === 0) {
            showToast("Please fill all item rows.", "error");
            return;
        }

        const subtotal = items.reduce((sum, i) => sum + i.total, 0);
        const extraCharges = parseFloat(wizExtraCharges.value) || 0;
        const discountPercent = parseFloat(wizDiscountInput.value) || 0;
        const discountVal = (subtotal + extraCharges) * (discountPercent / 100);
        const taxable = (subtotal + extraCharges) - discountVal;
        const taxPercent = parseFloat(wizTaxInput.value) || 0;
        const taxVal = taxable * (taxPercent / 100);
        const grandTotal = taxable + taxVal;

        const docData = {
            customerId,
            customerDetails,
            date,
            eventDate,
            eventLocation,
            eventDetails,
            items,
            subtotal,
            extraCharges,
            discountPercent,
            discountVal,
            taxPercent,
            taxVal,
            grandTotal,
            createdDate: new Date().toISOString()
        };

        // Preserve signature values if editing
        let existingDoc = null;
        if (docId) {
            existingDoc = type === 'Invoice'
                ? appState.invoices.find(i => i.id === docId)
                : appState.quotations.find(q => q.id === docId);
        }
        docData.termsAccepted = existingDoc ? (existingDoc.termsAccepted || false) : false;
        if (existingDoc && existingDoc.signatureData) {
            docData.signatureData = existingDoc.signatureData;
            docData.acceptanceDate = existingDoc.acceptanceDate;
        }

        // Invoice/Booking conditional saves
        if (type === 'Invoice') {
            docData.number = docNumberInput.value.trim() || generateInvoiceNum();
            docData.paymentStatus = docPaymentStatus.value;
            docData.paymentMode = docPaymentMode.value;
            
            if (docData.paymentStatus === 'Paid') {
                docData.paidAmount = grandTotal;
                docData.balanceDue = 0;
            } else if (docData.paymentStatus === 'Partial') {
                docData.paidAmount = parseFloat(wizPaidAmountInput.value) || 0;
                docData.balanceDue = grandTotal - docData.paidAmount;
            } else {
                docData.paidAmount = 0;
                docData.balanceDue = grandTotal;
            }
        } else {
            docData.type = type; // Quotation, Booking, Completed
            docData.number = docNumberInput.value.trim() || generateBookingNum();
            docData.status = type === 'Quotation' ? 'Pending' : 'Confirmed';
            docData.selectionStatus = selectionStatus;
        }

        if (appState.dbType === 'demo') {
            if (type === 'Invoice') {
                if (docId) {
                    const idx = appState.invoices.findIndex(i => i.id === docId);
                    if (idx !== -1) appState.invoices[idx] = { id: docId, ...docData };
                } else {
                    docData.id = 'inv_' + Date.now();
                    appState.invoices.push(docData);
                }
                localStorage.setItem('demo_invoices', JSON.stringify(appState.invoices));
                
                // If converted from quote/booking, set status to Converted
                if (convertedFrom) {
                    const qIdx = appState.quotations.findIndex(q => q.id === convertedFrom);
                    if (qIdx !== -1) {
                        appState.quotations[qIdx].status = 'Converted';
                        localStorage.setItem('demo_quotations', JSON.stringify(appState.quotations));
                    }
                }
                showToast("Invoice Saved!");
            } else {
                if (docId) {
                    const idx = appState.quotations.findIndex(q => q.id === docId);
                    if (idx !== -1) appState.quotations[idx] = { id: docId, ...docData };
                } else {
                    docData.id = 'qt_' + Date.now();
                    appState.quotations.push(docData);
                }
                localStorage.setItem('demo_quotations', JSON.stringify(appState.quotations));
                
                // Handle Enquiry convert completion
                if (convertedFrom && convertedFrom.startsWith('enq_')) {
                    const enqId = convertedFrom.replace('enq_', '');
                    const enqIdx = appState.enquiries.findIndex(e => e.id === enqId);
                    if (enqIdx !== -1) {
                        appState.enquiries[enqIdx].status = 'Converted';
                        localStorage.setItem('demo_enquiries', JSON.stringify(appState.enquiries));
                    }
                }
                showToast("Booking/Quotation Saved!");
            }
            closeDocModal();
            refreshAllUI();
            switchTab(type === 'Invoice' ? 'invoices' : 'bookings');
        } else {
            const colName = type === 'Invoice' ? 'invoices' : 'quotations';
            let dbPromise;
            
            if (docId) {
                dbPromise = fbStore.collection(colName).doc(docId).set(docData);
            } else {
                dbPromise = fbStore.collection(colName).add(docData);
            }

            dbPromise.then((docRef) => {
                if (type === 'Invoice' && convertedFrom) {
                    fbStore.collection('quotations').doc(convertedFrom).update({ status: 'Converted' });
                }
                if (type !== 'Invoice' && convertedFrom && convertedFrom.startsWith('enq_')) {
                    const enqId = convertedFrom.replace('enq_', '');
                    fbStore.collection('enquiries').doc(enqId).update({ status: 'Converted' });
                }
                showToast("Document saved in Cloud database!");
                closeDocModal();
            }).catch(err => {
                showToast("Cloud Save Fail: " + err.message, "error");
            });
        }
    });

    // Render Bookings & Quotations
    const renderBookingsList = () => {
        const query = document.getElementById('booking-search-input').value.toLowerCase();
        const activeFilter = document.querySelector('#booking-status-filters .filter-btn.active').getAttribute('data-filter');
        
        bookingsListTbody.innerHTML = '';

        let filtered = appState.quotations.filter(q => 
            q.number.toLowerCase().includes(query) ||
            q.customerDetails.name.toLowerCase().includes(query) ||
            q.customerDetails.mobile.includes(query)
        );

        if (activeFilter !== 'all') {
            filtered = filtered.filter(q => q.type === activeFilter || q.status === activeFilter);
        }

        if (filtered.length === 0) {
            bookingsListTbody.innerHTML = `<tr><td colspan="8" class="empty-state-row">No bookings/quotations matching query filters.</td></tr>`;
            return;
        }

        filtered.forEach(b => {
            const tr = document.createElement('tr');
            
            const eventDateStr = new Date(b.eventDate).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            // Map selection status colors
            let statusStyle = "bg-stone-800 text-stone-300";
            const selStatus = b.selectionStatus || 'Not Started';
            if (selStatus === 'Selection Pending') statusStyle = "bg-orange-500/10 text-orange-500 border border-orange-500/20";
            if (selStatus === 'Selected (Ready for Edit)') statusStyle = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            if (selStatus === 'Editing In Progress') statusStyle = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
            if (selStatus === 'Completed (Ready to Print)' || selStatus === 'Delivered') statusStyle = "bg-green-500/10 text-green-500 border border-green-500/20";

            tr.innerHTML = `
                <td><strong>${b.number}</strong></td>
                <td>${b.customerDetails.name}</td>
                <td>${b.customerDetails.mobile}</td>
                <td>${eventDateStr}</td>
                <td><span class="text-xs font-semibold px-2.5 py-1 rounded-sm ${statusStyle}">${selStatus}</span></td>
                <td><strong>₹${b.grandTotal.toLocaleString('en-IN')}</strong></td>
                <td><span class="status-pill ${b.type.toLowerCase()}">${b.type}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn view" title="View Print Preview" data-id="${b.id}"><i class="fa-solid fa-file-lines"></i></button>
                        ${b.type === 'Quotation' && b.status === 'Pending' ? `<button class="table-action-btn convert" title="Convert to Invoice" data-id="${b.id}"><i class="fa-solid fa-arrows-spin"></i></button>` : ''}
                        <button class="table-action-btn edit" title="Edit Booking/Quotation" data-id="${b.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="table-action-btn whatsapp" title="Share via WhatsApp" data-id="${b.id}"><i class="fa-brands fa-whatsapp"></i></button>
                        <button class="table-action-btn delete" title="Delete Booking" data-id="${b.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector('.view').addEventListener('click', () => showDocumentA4Preview(b.type, b.id));
            tr.querySelector('.edit').addEventListener('click', () => editDocument(b.type, b.id));
            tr.querySelector('.whatsapp').addEventListener('click', () => triggerWhatsAppSharing(b.type, b.id));
            tr.querySelector('.delete').addEventListener('click', () => deleteDocument(b.type, b.id));
            
            const convertBtn = tr.querySelector('.convert');
            if (convertBtn) {
                convertBtn.addEventListener('click', () => convertQuoteToInvoiceWizard(b.id));
            }

            bookingsListTbody.appendChild(tr);
        });
    };

    document.querySelectorAll('#booking-status-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#booking-status-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBookingsList();
        });
    });
    const bookingSearchInput = document.getElementById('booking-search-input'); if (bookingSearchInput) bookingSearchInput.addEventListener('input', renderBookingsList);

    const convertQuoteToInvoiceWizard = (id) => {
        const quote = appState.quotations.find(q => q.id === id);
        if (!quote) return;

        openDocumentWizard('Invoice', quote.id);
        
        docCustomerSelect.value = quote.customerId;
        const event = new Event('change');
        docCustomerSelect.dispatchEvent(event);

        docEventDateInput.value = quote.eventDate || formatToday();
        docEventLocInput.value = quote.eventLocation || '';
        docEventDetailsInput.value = quote.eventDetails || '';

        wizExtraCharges.value = quote.extraCharges || 0;
        wizDiscountInput.value = quote.discountPercent;
        wizTaxInput.value = quote.taxPercent;

        docItemsTbody.innerHTML = '';
        quote.items.forEach(item => {
            addWizardItemRow(item);
        });

        calculateWizardTotals();
    };

    const editDocument = (type, id) => {
        const doc = type === 'Invoice'
            ? appState.invoices.find(i => i.id === id)
            : appState.quotations.find(q => q.id === id);

        if (!doc) return;

        openDocumentWizard(type);
        
        document.getElementById('doc-id-hidden').value = doc.id;
        
        docCustomerSelect.value = doc.customerId;
        const event = new Event('change');
        docCustomerSelect.dispatchEvent(event);

        docDateInput.value = doc.date;
        docEventDateInput.value = doc.eventDate || doc.date;
        docEventLocInput.value = doc.eventLocation || '';
        docEventDetailsInput.value = doc.eventDetails || '';
        docNumberInput.value = doc.number;

        if (type === 'Invoice') {
            docPaymentStatus.value = doc.paymentStatus;
            handlePaymentStatusUIFields(doc.paymentStatus);
            docPaymentMode.value = doc.paymentMode;
            wizPaidAmountInput.value = doc.paidAmount;
        } else {
            docSelectionStatus.value = doc.selectionStatus || 'Not Started';
        }
        
        wizExtraCharges.value = doc.extraCharges || 0;
        wizDiscountInput.value = doc.discountPercent || 0;
        wizTaxInput.value = doc.taxPercent || 0;

        docItemsTbody.innerHTML = '';
        doc.items.forEach(item => {
            addWizardItemRow(item);
        });

        calculateWizardTotals();
    };

    // Render Invoices Table
    const renderInvoicesList = () => {
        const query = document.getElementById('invoice-search-input').value.toLowerCase();
        const activeFilter = document.querySelector('#invoice-status-filters .filter-btn.active').getAttribute('data-filter');
        
        invoicesListTbody.innerHTML = '';

        let filtered = appState.invoices.filter(i => 
            i.number.toLowerCase().includes(query) ||
            i.customerDetails.name.toLowerCase().includes(query) ||
            i.customerDetails.mobile.includes(query)
        );

        if (activeFilter !== 'all') {
            filtered = filtered.filter(i => i.paymentStatus === activeFilter);
        }

        if (filtered.length === 0) {
            invoicesListTbody.innerHTML = `<tr><td colspan="7" class="empty-state-row">No invoices found matching filter options.</td></tr>`;
            return;
        }

        filtered.forEach(inv => {
            const tr = document.createElement('tr');
            
            const formattedDate = new Date(inv.date).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            tr.innerHTML = `
                <td><strong>${inv.number}</strong></td>
                <td>${inv.customerDetails.name}</td>
                <td>${inv.customerDetails.mobile}</td>
                <td>${formattedDate}</td>
                <td><strong>₹${inv.grandTotal.toLocaleString('en-IN')}</strong></td>
                <td><span class="status-pill ${inv.paymentStatus.toLowerCase()}">${inv.paymentStatus}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn view" title="View Print Preview" data-id="${inv.id}"><i class="fa-solid fa-file-invoice"></i></button>
                        <button class="table-action-btn edit" title="Edit Invoice" data-id="${inv.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="table-action-btn whatsapp" title="Share via WhatsApp" data-id="${inv.id}"><i class="fa-brands fa-whatsapp"></i></button>
                        <button class="table-action-btn delete" title="Delete Invoice" data-id="${inv.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector('.view').addEventListener('click', () => showDocumentA4Preview('Invoice', inv.id));
            tr.querySelector('.edit').addEventListener('click', () => editDocument('Invoice', inv.id));
            tr.querySelector('.whatsapp').addEventListener('click', () => triggerWhatsAppSharing('Invoice', inv.id));
            tr.querySelector('.delete').addEventListener('click', () => deleteDocument('Invoice', inv.id));

            invoicesListTbody.appendChild(tr);
        });
    };

    document.querySelectorAll('#invoice-status-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#invoice-status-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderInvoicesList();
        });
    });
    const invoiceSearchInput = document.getElementById('invoice-search-input'); if (invoiceSearchInput) invoiceSearchInput.addEventListener('input', renderInvoicesList);

    const deleteDocument = (type, id) => {
        const confirmDel = confirm(`Are you sure you want to delete this ${type} document?`);
        if (!confirmDel) return;

        if (appState.dbType === 'demo') {
            if (type === 'Invoice') {
                appState.invoices = appState.invoices.filter(i => i.id !== id);
                localStorage.setItem('demo_invoices', JSON.stringify(appState.invoices));
            } else {
                appState.quotations = appState.quotations.filter(q => q.id !== id);
                localStorage.setItem('demo_quotations', JSON.stringify(appState.quotations));
            }
            showToast(`${type} document deleted.`);
            refreshAllUI();
        } else {
            const col = type === 'Invoice' ? 'invoices' : 'quotations';
            fbStore.collection(col).doc(id).delete()
                .then(() => showToast(`${type} deleted from Cloud.`))
                .catch(err => showToast("Failed to delete: " + err.message, "error"));
        }
    };

    // =========================================================================
    // 11. A4 REPORT DOCUMENT RENDERING
    // =========================================================================
    
    let activePreviewDoc = null;
    let activePreviewType = null;

    const showDocumentA4Preview = (type, id) => {
        const doc = type === 'Invoice' 
            ? appState.invoices.find(i => i.id === id)
            : appState.quotations.find(q => q.id === id);

        if (!doc) {
            showToast("Document not found.", "error");
            return;
        }

        activePreviewDoc = doc;
        activePreviewType = type;

        // --- Apply Active Billing Theme ---
        const currentTheme = localStorage.getItem('invoice_theme') || 'gold';
        invoiceThemeSelect.value = currentTheme;
        const a4Doc = document.getElementById('a4-document');
        a4Doc.className = `a4-document theme-${currentTheme}`;

        // --- Render Brand Header ---
        document.getElementById('a4-studio-name').textContent = appState.settings.studioName.toUpperCase();
        document.getElementById('a4-studio-phone-val').textContent = appState.settings.studioPhone;
        document.getElementById('a4-studio-email-val').textContent = appState.settings.studioEmail || 'N/A';
        document.getElementById('a4-studio-address-val').textContent = appState.settings.studioAddress;

        // --- Render Customer Billed Info ---
        document.getElementById('a4-cust-name-val').textContent = doc.customerDetails.name;
        document.getElementById('a4-cust-phone-val').textContent = doc.customerDetails.mobile;
        
        if (doc.customerDetails.email) {
            document.getElementById('a4-cust-email-group').classList.remove('hidden');
            document.getElementById('a4-cust-email-val').textContent = doc.customerDetails.email;
        } else {
            document.getElementById('a4-cust-email-group').classList.add('hidden');
        }

        if (doc.customerDetails.address) {
            document.getElementById('a4-cust-address-group').classList.remove('hidden');
            document.getElementById('a4-cust-address-val').textContent = doc.customerDetails.address;
        } else {
            document.getElementById('a4-cust-address-group').classList.add('hidden');
        }

        // --- Render Meta details ---
        document.getElementById('a4-doc-type-badge').textContent = type.toUpperCase();
        document.getElementById('a4-doc-num-val').textContent = doc.number;
        document.getElementById('a4-booking-id-val').textContent = doc.bookingId || doc.id.substring(0,8).toUpperCase();
        
        const formattedDate = new Date(doc.date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        document.getElementById('a4-doc-date-val').textContent = formattedDate;

        const eventDateStr = new Date(doc.eventDate || doc.date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        document.getElementById('a4-event-date-val').textContent = eventDateStr;
        document.getElementById('a4-event-venue-val').textContent = doc.eventLocation || 'Balod Studio Set';
        document.getElementById('a4-event-details-val').textContent = doc.eventDetails || 'N/A';

        const payStatusTr = document.getElementById('a4-payment-status-tr');
        const payModeTr = document.getElementById('a4-payment-mode-tr');

        if (type === 'Invoice') {
            payStatusTr.classList.remove('hidden');
            payModeTr.classList.remove('hidden');
            document.getElementById('a4-pay-status-val').textContent = doc.paymentStatus;
            document.getElementById('a4-pay-mode-val').textContent = doc.paymentMode;
        } else {
            payStatusTr.classList.add('hidden');
            payModeTr.classList.add('hidden');
        }

        // --- Render Table Items ---
        a4ItemsTbody.innerHTML = '';
        doc.items.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td class="text-right">₹${item.rate.toLocaleString('en-IN')}</td>
                <td class="text-center">${item.qty}</td>
                <td class="text-right">₹${item.total.toLocaleString('en-IN')}</td>
            `;
            a4ItemsTbody.appendChild(tr);
        });

        // --- Render Aggregates ---
        document.getElementById('a4-subtotal-val').textContent = `₹${doc.subtotal.toLocaleString('en-IN')}`;
        
        const extraCharges = doc.extraCharges || 0;
        if (extraCharges > 0) {
            document.getElementById('a4-extra-charges-row').classList.remove('hidden');
            document.getElementById('a4-extra-charges-val').textContent = `+₹${extraCharges.toLocaleString('en-IN')}`;
        } else {
            document.getElementById('a4-extra-charges-row').classList.add('hidden');
        }

        if (doc.discountPercent > 0) {
            document.getElementById('a4-discount-row').classList.remove('hidden');
            document.getElementById('a4-discount-percent').textContent = doc.discountPercent;
            document.getElementById('a4-discount-val').textContent = `-₹${doc.discountVal.toLocaleString('en-IN')}`;
        } else {
            document.getElementById('a4-discount-row').classList.add('hidden');
        }

        if (doc.taxPercent > 0) {
            document.getElementById('a4-tax-row').classList.remove('hidden');
            document.getElementById('a4-tax-percent').textContent = doc.taxPercent;
            document.getElementById('a4-tax-val').textContent = `+₹${doc.taxVal.toLocaleString('en-IN')}`;
        } else {
            document.getElementById('a4-tax-row').classList.add('hidden');
        }

        document.getElementById('a4-grand-total-val').textContent = `₹${doc.grandTotal.toLocaleString('en-IN')}`;

        const paidRow = document.getElementById('a4-paid-amount-row');
        const balanceRow = document.getElementById('a4-balance-row');

        if (type === 'Invoice') {
            paidRow.classList.remove('hidden');
            balanceRow.classList.remove('hidden');
            document.getElementById('a4-paid-val').textContent = `₹${doc.paidAmount.toLocaleString('en-IN')}`;
            document.getElementById('a4-balance-val').textContent = `₹${doc.balanceDue.toLocaleString('en-IN')}`;
        } else {
            paidRow.classList.add('hidden');
            balanceRow.classList.add('hidden');
        }

        // --- UPI QR Code Rendering ---
        const qrSection = document.getElementById('a4-upi-qr-section');
        const qrPlaceholder = document.getElementById('a4-upi-qr-placeholder');

        if (type === 'Invoice' && doc.paymentStatus !== 'Paid') {
            qrSection.classList.remove('hidden');
            qrPlaceholder.classList.add('hidden');

            const amountToRequest = doc.paymentStatus === 'Partial' ? doc.balanceDue : doc.grandTotal;
            const encodedMerchant = encodeURIComponent(appState.settings.payeeName);
            const upiLink = `upi://pay?pa=${appState.settings.upiId}&pn=${encodedMerchant}&am=${amountToRequest}&cu=INR`;
            
            a4UpiQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`;
            document.getElementById('a4-payee-merchant-name').textContent = appState.settings.payeeName;
            document.getElementById('a4-payee-upi-id').textContent = appState.settings.upiId;
        } else {
            qrSection.classList.add('hidden');
            qrPlaceholder.classList.remove('hidden');
            if (type === 'Invoice') {
                qrPlaceholder.querySelector('.info-tag').innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> This Invoice is fully Paid. Thank you!`;
            } else {
                qrPlaceholder.querySelector('.info-tag').innerHTML = `<i class="fa-solid fa-circle-info"></i> Dynamic scan QR payments are enabled on active Invoices only.`;
            }
        }

        // --- Render T&C and Signature Studio Name ---
        const detailedTC = `1. बुकिंग 50% एडवांस भुगतान पर ही कन्फर्म होगी।\n2. फोटो चयन (Photo Selection) के साथ कुल पैकेज राशि का 30% भुगतान करना अनिवार्य होगा।\n3. शेष 20% भुगतान फोटो/वीडियो की अंतिम डिलीवरी से पहले अथवा डिलीवरी के समय करना अनिवार्य होगा।\n4. फोटो एवं वीडियो की अंतिम डिलीवरी फोटो चयन की तिथि से 30–45 कार्य दिवस के भीतर की जाएगी।\n5. एल्बम डिज़ाइन की अंतिम स्वीकृति के बाद एल्बम संशोधन अथवा अतिरिक्त प्रिंटिंग कार्य अतिरिक्त शुल्क पर किया जाएगा।\n6. बुकिंग रद्द होने की स्थिति में जमा की गई अग्रिम राशि Non-Refundable (वापसी योग्य नहीं) होगी।\n7. पैकेज में शामिल सेवाओं के अतिरिक्त अन्य किसी भी अतिरिक्त कार्य के लिए अलग से शुल्क लिया जाएगा।\n8. स्टूडियो डिलीवरी की तिथि से अधिकतम 90 दिनों तक ही डेटा सुरक्षित रखेगा।\n9. सभी फोटो/वीडियो का कॉपीराइट Dewangan Photo & Videography के पास सुरक्षित रहेगा। ग्राहक को केवल व्यक्तिगत उपयोग का अधिकार होगा।`;
        document.getElementById('a4-terms-val').textContent = detailedTC;
        document.getElementById('a4-signature-studio-name').textContent = appState.settings.studioName;

        // --- Render Digital Signatures accepted state ---
        const custSigImg = document.getElementById('a4-cust-sig-image');
        const custSigPendingText = document.getElementById('a4-cust-sig-pending');
        const custSigDateSpan = document.getElementById('a4-cust-sig-date');

        if (doc.termsAccepted && doc.signatureData) {
            custSigImg.src = doc.signatureData;
            custSigImg.classList.remove('hidden');
            custSigPendingText.classList.add('hidden');
            
            const acceptedDate = new Date(doc.acceptanceDate).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            custSigDateSpan.textContent = `Accepted on: ${acceptedDate}`;
            previewSignBtn.classList.add('hidden');
        } else {
            custSigImg.src = '';
            custSigImg.classList.add('hidden');
            custSigPendingText.classList.remove('hidden');
            custSigDateSpan.textContent = '';
            previewSignBtn.classList.remove('hidden');
        }

        previewModal.classList.remove('hidden');
    };

    if (closePreviewModalBtn) closePreviewModalBtn.addEventListener('click', () => {
        previewModal.classList.add('hidden');
        activePreviewDoc = null;
        activePreviewType = null;
    });

    if (invoiceThemeSelect) invoiceThemeSelect.addEventListener('change', () => {
        const selectedTheme = invoiceThemeSelect.value;
        localStorage.setItem('invoice_theme', selectedTheme);
        const a4Doc = document.getElementById('a4-document');
        a4Doc.className = `a4-document theme-${selectedTheme}`;
        showToast(`Theme switched to ${selectedTheme.toUpperCase()}`);
    });

    if (previewPrintBtn) previewPrintBtn.addEventListener('click', () => {
        window.print();
    });

    if (previewPdfBtn) previewPdfBtn.addEventListener('click', () => {
        if (!activePreviewDoc) return;
        const element = document.getElementById('a4-document');
        const filename = `${activePreviewType}_${activePreviewDoc.number}.pdf`;
        
        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        element.classList.add('pdf-rendering');
        showToast("Generating PDF download, please wait...");

        html2pdf().set(opt).from(element).save()
            .then(() => showToast("PDF Download complete!"))
            .catch(err => {
                console.error("PDF Gen Error:", err);
                showToast("PDF creation failed.", "error");
            })
            .finally(() => {
                element.classList.remove('pdf-rendering');
            });
    });

    // =========================================================================
    // 12. DIGITAL SIGNATURE CANVAS CONTROLS
    // =========================================================================

    const initSignatureCanvas = () => {
        if (!signatureCanvas || !canvasContext) return;
        canvasContext.strokeStyle = '#1e3a8a';
        canvasContext.lineWidth = 2.5;
        canvasContext.lineCap = 'round';
        canvasContext.lineJoin = 'round';

        signatureCanvas.addEventListener('mousedown', (e) => {
            if (!tcAgreeCheckbox.checked) {
                showToast("Please agree to the Terms & Conditions first.", "error");
                return;
            }
            isDrawing = true;
            hasDrawn = true;
            const coords = getCanvasCoords(e);
            canvasContext.beginPath();
            canvasContext.moveTo(coords.x, coords.y);
        });

        signatureCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const coords = getCanvasCoords(e);
            canvasContext.lineTo(coords.x, coords.y);
            canvasContext.stroke();
        });

        signatureCanvas.addEventListener('mouseup', () => isDrawing = false);
        signatureCanvas.addEventListener('mouseout', () => isDrawing = false);

        signatureCanvas.addEventListener('touchstart', (e) => {
            if (!tcAgreeCheckbox.checked) {
                showToast("Please agree to the Terms & Conditions first.", "error");
                return;
            }
            e.preventDefault();
            isDrawing = true;
            hasDrawn = true;
            const touch = e.touches[0];
            const coords = getCanvasCoords(touch);
            canvasContext.beginPath();
            canvasContext.moveTo(coords.x, coords.y);
        });

        signatureCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const touch = e.touches[0];
            const coords = getCanvasCoords(touch);
            canvasContext.lineTo(coords.x, coords.y);
            canvasContext.stroke();
        });

        signatureCanvas.addEventListener('touchend', () => isDrawing = false);

        if (clearCanvasBtn) clearCanvasBtn.addEventListener('click', () => {
            canvasContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
            hasDrawn = false;
            showToast("Signature board cleared.");
        });
    };

    const getCanvasCoords = (event) => {
        const rect = signatureCanvas.getBoundingClientRect();
        const scaleX = signatureCanvas.width / rect.width;
        const scaleY = signatureCanvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    };

    const renderDashboard = () => {
        // Render KPI Counters
        if (dashEnquiries) {
            dashEnquiries.textContent = appState.enquiries.length;
        }
        if (dashEnquiriesPending) {
            const pendingCount = appState.enquiries.filter(e => e.status === 'Pending').length;
            dashEnquiriesPending.textContent = `${pendingCount} pending reply`;
        }
        if (dashPhotos) {
            dashPhotos.textContent = appState.gallery.length;
        }
        if (dashCategories) {
            dashCategories.textContent = appState.categories.length;
        }
        if (dashClients) {
            dashClients.textContent = appState.customers.length;
        }

        // Render Recent Customers
        if (recentCustomersTbody) {
            recentCustomersTbody.innerHTML = '';
            const recentCusts = [...appState.customers].reverse().slice(0, 5);

            if (recentCusts.length === 0) {
                recentCustomersTbody.innerHTML = `<tr><td colspan="3" class="empty-state-row" style="text-align:center; padding: 24px; color: #999;">No clients registered yet.</td></tr>`;
            } else {
                recentCusts.forEach(cust => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${cust.name}</strong></td>
                        <td>${cust.mobile}</td>
                        <td>${cust.address || '<span class="text-stone-400">N/A</span>'}</td>
                    `;
                    recentCustomersTbody.appendChild(tr);
                });
            }
        }
    };

    // =========================================================================
    // 15. REVENUE FINANCIAL REPORTS CONTROLLER
    // =========================================================================
    
    const initializeReportsTab = () => {
        repMonthInput.value = formatCurrentMonth();
        repDateInput.value = formatToday();
        repYearInput.value = new Date().getFullYear();
        
        handleReportRangeUI();
        queryFinancialReport();
    };

    const handleReportRangeUI = () => {
        const range = repRangeSelect.value;
        if (range === 'Daily' || range === 'Daybook') {
            repDateInput.classList.remove('hidden');
            repMonthInput.classList.add('hidden');
            repYearInput.classList.add('hidden');
        } else if (range === 'Monthly') {
            repDateInput.classList.add('hidden');
            repMonthInput.classList.remove('hidden');
            repYearInput.classList.add('hidden');
        } else {
            repDateInput.classList.add('hidden');
            repMonthInput.classList.add('hidden');
            repYearInput.classList.remove('hidden');
        }
    };

    if (repRangeSelect) repRangeSelect.addEventListener('change', handleReportRangeUI);

    const queryFinancialReport = () => {
        const range = repRangeSelect.value;
        let filteredInvoices = [];
        let labels = [];
        let datasetData = [];

        if (range === 'Daybook') {
            const targetDate = repDateInput.value;
            filteredInvoices = appState.invoices.filter(i => i.date === targetDate);
            const filteredQuotes = appState.quotations.filter(q => q.date === targetDate);

            // Compute ledger rows combining invoices & bookings
            const daybookTransactions = [
                ...filteredInvoices.map(i => ({ type: 'Invoice', doc: i })),
                ...filteredQuotes.map(q => ({ type: q.type, doc: q }))
            ];

            // Render stats card updates
            const totalSalesVal = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
            const totalRecVal = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
            const totalBalVal = filteredInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

            repTotalInvoiced.textContent = `₹${totalSalesVal.toLocaleString('en-IN')}`;
            repTotalReceived.textContent = `₹${totalRecVal.toLocaleString('en-IN')}`;
            repTotalBalance.textContent = `₹${totalBalVal.toLocaleString('en-IN')}`;
            repInvoicesCount.textContent = daybookTransactions.length;

            // Render chart data
            labels = ['Invoices Paid', 'Invoices Balance', 'Bookings Created'];
            datasetData = [
                totalRecVal,
                totalBalVal,
                filteredQuotes.reduce((sum, q) => sum + q.grandTotal, 0)
            ];

            // Render Daybook merged ledger table
            reportsLedgerTbody.innerHTML = '';
            if (daybookTransactions.length === 0) {
                reportsLedgerTbody.innerHTML = `<tr><td colspan="7" class="empty-state-row">No transaction entries found on the selected date.</td></tr>`;
            } else {
                daybookTransactions.forEach(t => {
                    const tr = document.createElement('tr');
                    const payMode = t.type === 'Invoice' ? t.doc.paymentMode : 'N/A';
                    const paidAmt = t.type === 'Invoice' ? t.doc.paidAmount : 0;
                    const balDue = t.type === 'Invoice' ? t.doc.balanceDue : t.doc.grandTotal;

                    tr.innerHTML = `
                        <td>${new Date(t.doc.date).toLocaleDateString('en-IN')}</td>
                        <td><strong>${t.doc.number}</strong> <span class="status-pill ${t.type.toLowerCase()}" style="font-size:10px; padding:2px 6px;">${t.type}</span></td>
                        <td>${t.doc.customerDetails.name}</td>
                        <td>₹${t.doc.grandTotal.toLocaleString('en-IN')}</td>
                        <td class="text-green">₹${paidAmt.toLocaleString('en-IN')}</td>
                        <td class="text-red">₹${balDue.toLocaleString('en-IN')}</td>
                        <td><span class="status-pill converted">${payMode}</span></td>
                    `;
                    reportsLedgerTbody.appendChild(tr);
                });
            }

            // Render Chart
            const ctx = document.getElementById('reportsChart');
            if (ctx) {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const textCol = isDark ? '#94a3b8' : '#64748b';
                if (reportsChart) reportsChart.destroy();
                reportsChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: datasetData,
                            backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { color: textCol } } }
                    }
                });
            }
            return;
        }

        if (range === 'Daily') {
            const targetDate = repDateInput.value;
            filteredInvoices = appState.invoices.filter(i => i.date === targetDate);
            
            // Graph data details
            labels = ['Today Payment', 'Remaining Balance'];
            const received = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
            const balance = filteredInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
            datasetData = [received, balance];

        } else if (range === 'Monthly') {
            const targetMonth = repMonthInput.value; // YYYY-MM
            filteredInvoices = appState.invoices.filter(i => i.date.substring(0, 7) === targetMonth);
            
            // Build daily graph bars
            const daysInMonth = new Date(targetMonth.split('-')[0], targetMonth.split('-')[1], 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
            datasetData = Array(daysInMonth).fill(0);
            
            filteredInvoices.forEach(inv => {
                const day = parseInt(inv.date.substring(8, 10));
                datasetData[day - 1] += inv.paidAmount;
            });

        } else {
            const targetYear = repYearInput.value; // YYYY
            filteredInvoices = appState.invoices.filter(i => i.date.substring(0, 4) === targetYear);
            
            // Build monthly graph bars
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            datasetData = Array(12).fill(0);
            
            filteredInvoices.forEach(inv => {
                const month = parseInt(inv.date.substring(5, 7));
                datasetData[month - 1] += inv.paidAmount;
            });
        }

        // Aggregate counts
        const totalVal = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
        const receivedVal = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
        const balanceVal = filteredInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

        repTotalInvoiced.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
        repTotalReceived.textContent = `₹${receivedVal.toLocaleString('en-IN')}`;
        repTotalBalance.textContent = `₹${balanceVal.toLocaleString('en-IN')}`;
        repInvoicesCount.textContent = filteredInvoices.length;

        // Render Ledger table
        reportsLedgerTbody.innerHTML = '';
        if (filteredInvoices.length === 0) {
            reportsLedgerTbody.innerHTML = `<tr><td colspan="7" class="empty-state-row">No invoice transactions recorded in selected range.</td></tr>`;
        } else {
            filteredInvoices.forEach(i => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(i.date).toLocaleDateString('en-IN')}</td>
                    <td><strong>${i.number}</strong></td>
                    <td>${i.customerDetails.name}</td>
                    <td>₹${i.grandTotal.toLocaleString('en-IN')}</td>
                    <td class="text-green">₹${i.paidAmount.toLocaleString('en-IN')}</td>
                    <td class="text-red">₹${i.balanceDue.toLocaleString('en-IN')}</td>
                    <td><span class="status-pill converted">${i.paymentMode}</span></td>
                `;
                reportsLedgerTbody.appendChild(tr);
            });
        }

        // Render Report Chart
        const ctx = document.getElementById('reportsChart');
        if (!ctx) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const textCol = isDark ? '#94a3b8' : '#64748b';

        if (reportsChart) reportsChart.destroy();

        reportsChart = new Chart(ctx, {
            type: range === 'Daily' ? 'doughnut' : 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Payments Received (₹)',
                    data: datasetData,
                    backgroundColor: range === 'Daily' ? ['#10b981', '#ef4444'] : '#ffd700',
                    borderColor: range === 'Daily' ? (isDark ? '#0f172a' : '#ffffff') : '#b89047',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: range === 'Daily', labels: { color: textCol } }
                },
                scales: range === 'Daily' ? {} : {
                    x: { grid: { color: gridColor }, ticks: { color: textCol } },
                    y: { grid: { color: gridColor }, ticks: { color: textCol } }
                }
            }
        });
    };

    if (fetchReportBtn) fetchReportBtn.addEventListener('click', queryFinancialReport);
    if (printReportBtn) printReportBtn.addEventListener('click', () => window.print());

    // =========================================================================
    // 16. SETTINGS PROFILE & UPI CONFIGS
    // =========================================================================
    
    if (studioProfileForm) studioProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        appState.settings.studioName = document.getElementById('set-studio-name').value.trim();
        appState.settings.studioPhone = document.getElementById('set-studio-phone').value.trim();
        appState.settings.studioEmail = document.getElementById('set-studio-email').value.trim();
        
        const websiteInput = document.getElementById('set-studio-website');
        if (websiteInput) appState.settings.studioWebsite = websiteInput.value.trim();
        
        appState.settings.studioAddress = document.getElementById('set-studio-address').value.trim();
        appState.settings.invoiceTerms = document.getElementById('set-invoice-terms').value.trim();

        // Redesigned Store Settings fields
        const altEmailInput = document.getElementById('set-studio-alt-email');
        if (altEmailInput) appState.settings.alternateEmail = altEmailInput.value.trim();

        const altPhoneInput = document.getElementById('set-studio-alt-phone');
        if (altPhoneInput) appState.settings.alternatePhone = altPhoneInput.value.trim();

        const currencyInput = document.getElementById('set-store-currency');
        if (currencyInput) appState.settings.currency = currencyInput.value;

        saveSettingsDatabase();
    });

    // REDESIGNED STORE SETTINGS UPLOADERS
    const uploadStoreLogoInput = document.getElementById('upload-store-logo-file');
    if (uploadStoreLogoInput) {
        uploadStoreLogoInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                const file = files[0];
                if (!file.type.startsWith('image/')) {
                    showToast("Please select an image file.", "error");
                    return;
                }
                const filenameLabel = document.getElementById('store-logo-filename');
                if (filenameLabel) filenameLabel.textContent = file.name;
                
                showToast("Compressing and uploading store logo...");
                compressImageFile(file, 600, 600)
                    .then(base64Url => {
                        appState.settings.logoUrl = base64Url;
                        const preview = document.getElementById('set-store-logo-preview');
                        if (preview) preview.src = base64Url;
                        showToast("Store logo loaded! Click 'Save Settings' to apply.");
                    })
                    .catch(err => {
                        console.error(err);
                        showToast("Failed to load store logo.", "error");
                    });
            }
        });
    }

    const uploadStoreFaviconInput = document.getElementById('upload-store-favicon-file');
    if (uploadStoreFaviconInput) {
        uploadStoreFaviconInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                const file = files[0];
                if (!file.type.startsWith('image/')) {
                    showToast("Please select an image file.", "error");
                    return;
                }
                const filenameLabel = document.getElementById('store-favicon-filename');
                if (filenameLabel) filenameLabel.textContent = file.name;
                
                showToast("Compressing and uploading store favicon...");
                compressImageFile(file, 64, 64, 0.7, true)
                    .then(base64Url => {
                        appState.settings.faviconUrl = base64Url;
                        const preview = document.getElementById('set-store-favicon-preview');
                        if (preview) preview.src = base64Url;
                        showToast("Store favicon loaded! Click 'Save Settings' to apply.");
                    })
                    .catch(err => {
                        console.error(err);
                        showToast("Failed to load store favicon.", "error");
                    });
            }
        });
    }

    const studioMediaForm = document.getElementById('studio-media-form');
    if (studioMediaForm) {
        studioMediaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            appState.settings.slide1Url = document.getElementById('set-slide-1').value.trim();
            appState.settings.slide2Url = document.getElementById('set-slide-2').value.trim();
            appState.settings.slide3Url = document.getElementById('set-slide-3').value.trim();
            appState.settings.aboutImageUrl = document.getElementById('set-about-image').value.trim();
            appState.settings.weddingCoverUrl = document.getElementById('set-wedding-cover').value.trim();
            appState.settings.preweddingCoverUrl = document.getElementById('set-prewedding-cover').value.trim();
            appState.settings.engagementCoverUrl = document.getElementById('set-engagement-cover').value.trim();
            appState.settings.birthdayCoverUrl = document.getElementById('set-birthday-cover').value.trim();
            appState.settings.maternityCoverUrl = document.getElementById('set-maternity-cover').value.trim();
            appState.settings.babyCoverUrl = document.getElementById('set-baby-cover').value.trim();
            appState.settings.videographyCoverUrl = document.getElementById('set-videography-cover').value.trim();
            appState.settings.droneCoverUrl = document.getElementById('set-drone-cover').value.trim();
            appState.settings.albumCoverUrl = document.getElementById('set-album-cover').value.trim();

            saveSettingsDatabase();
        });
    }

    // =========================================================================
    // ABOUT SETTINGS HANDLER
    // =========================================================================
    const aboutSettingForm = document.getElementById('about-setting-form');
    if (aboutSettingForm) {
        const uploadLogoInput = document.getElementById('upload-about-logo-file');
        const logoPreview = document.getElementById('set-about-logo-preview');
        const filenameLabel = document.getElementById('about-logo-filename');

        if (uploadLogoInput) {
            uploadLogoInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (!file.type.startsWith('image/')) {
                        showToast("Please select an image file.", "error");
                        return;
                    }
                    filenameLabel.textContent = file.name;
                    showToast("Compressing and uploading logo...");
                    compressImageFile(file, 600, 600)
                        .then(base64Url => {
                            appState.settings.aboutImageUrl = base64Url;
                            if (logoPreview) logoPreview.src = base64Url;
                            showToast("Logo processed! Click 'Save Settings' to apply.");
                        })
                        .catch(err => {
                            console.error(err);
                            showToast("Failed to load logo image.", "error");
                        });
                }
            });
        }

        const uploadBrandLogoInput = document.getElementById('upload-brand-logo-file');
        const brandLogoPreview = document.getElementById('set-brand-logo-preview');
        const brandLogoFilename = document.getElementById('brand-logo-filename');
        const resetBrandLogoBtn = document.getElementById('reset-brand-logo-btn');
        const brandPlaceholder = document.getElementById('set-brand-logo-preview-placeholder');

        if (uploadBrandLogoInput) {
            uploadBrandLogoInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (!file.type.startsWith('image/')) {
                        showToast("Please select an image file.", "error");
                        return;
                    }
                    brandLogoFilename.textContent = file.name;
                    showToast("Compressing and uploading brand logo...");
                    compressImageFile(file, 400, 160, 0.7, true)
                        .then(base64Url => {
                            appState.settings.logoUrl = base64Url;
                            if (brandLogoPreview) {
                                brandLogoPreview.src = base64Url;
                                brandLogoPreview.classList.remove('hidden');
                            }
                            if (brandPlaceholder) brandPlaceholder.classList.add('hidden');
                            if (resetBrandLogoBtn) resetBrandLogoBtn.style.display = 'inline-block';
                            showToast("Brand logo loaded! Click 'Save Settings' to apply.");
                        })
                        .catch(err => {
                            console.error(err);
                            showToast("Failed to load brand logo.", "error");
                        });
                }
            });
        }

        if (resetBrandLogoBtn) {
            resetBrandLogoBtn.addEventListener('click', () => {
                appState.settings.logoUrl = "";
                if (brandLogoPreview) {
                    brandLogoPreview.src = "";
                    brandLogoPreview.classList.add('hidden');
                }
                if (brandLogoFilename) brandLogoFilename.textContent = "No file chosen";
                if (brandPlaceholder) brandPlaceholder.classList.remove('hidden');
                resetBrandLogoBtn.style.display = 'none';
                if (uploadBrandLogoInput) uploadBrandLogoInput.value = "";
                showToast("Logo reset to default! Click 'Save Settings' to apply.");
            });
        }

        aboutSettingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            appState.settings.aboutTitle = document.getElementById('set-about-title').value.trim();
            appState.settings.aboutDescHtml = document.getElementById('set-about-desc-editor').innerHTML;
            
            saveSettingsDatabase();
        });
    }

    if (studioPaymentForm) {
        if (studioPaymentForm) studioPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            appState.settings.upiId = document.getElementById('set-upi-id').value.trim();
            appState.settings.payeeName = document.getElementById('set-payee-name').value.trim();

            const upiLink = `upi://pay?pa=${appState.settings.upiId}&pn=${encodeURIComponent(appState.settings.payeeName)}`;
            const demoQrImage = document.getElementById('demo-qr-image');
            if (demoQrImage) {
                demoQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`;
            }

            saveSettingsDatabase();
        });
    }

    const saveSettingsDatabase = () => {
        if (appState.dbType === 'demo') {
            try {
                localStorage.setItem('studio_settings', JSON.stringify(appState.settings));
                showToast("Settings saved locally!");
                applyStudioSettingsUI();
            } catch (err) {
                console.error("Save error:", err);
                showToast("Save failed: " + err.message, "error");
            }
        } else {
            fbStore.collection('settings').doc('profile').set(appState.settings)
                .then(() => {
                    showToast("Settings updated in Firebase Cloud!");
                })
                .catch(err => {
                    showToast("Cloud update fail: " + err.message, "error");
                });
        }
    };

    // =========================================================================
    // 17. BACKUP, RESTORE & SYSTEM RESETS
    // =========================================================================
    
    if (backupExportBtn) backupExportBtn.addEventListener('click', () => {
        const backupData = {
            version: '1.2.0',
            exportedAt: new Date().toISOString(),
            customers: appState.customers,
            invoices: appState.invoices,
            quotations: appState.quotations,
            enquiries: appState.enquiries,
            services: appState.services,
            gallery: appState.gallery,
            blog: appState.blog,
            categories: appState.categories,
            mediaItems: appState.mediaItems,
            settings: appState.settings
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dewangan_studio_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        showToast("Backup exported successfully!");
    });

    if (backupImportFile) backupImportFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmImp = confirm("Are you sure you want to import this database? Existing records will be overwritten.");
        if (!confirmImp) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                
                if (!parsed.customers || !parsed.invoices || !parsed.quotations || !parsed.settings) {
                    throw new Error("Missing required database collections in JSON.");
                }

                if (appState.dbType === 'demo') {
                    appState.customers = parsed.customers;
                    appState.invoices = parsed.invoices;
                    appState.quotations = parsed.quotations;
                    appState.enquiries = parsed.enquiries || [];
                    appState.services = parsed.services || defaultServices;
                    appState.gallery = parsed.gallery || defaultGallery;
                    appState.blog = parsed.blog || defaultBlog;
                    appState.categories = parsed.categories || defaultCategories;
                    appState.mediaItems = parsed.mediaItems || defaultMediaItems;
                    appState.settings = parsed.settings;

                    localStorage.setItem('demo_customers', JSON.stringify(appState.customers));
                    localStorage.setItem('demo_invoices', JSON.stringify(appState.invoices));
                    localStorage.setItem('demo_quotations', JSON.stringify(appState.quotations));
                    localStorage.setItem('demo_enquiries', JSON.stringify(appState.enquiries));
                    localStorage.setItem('demo_services', JSON.stringify(appState.services));
                    localStorage.setItem('demo_gallery', JSON.stringify(appState.gallery));
                    localStorage.setItem('demo_blog', JSON.stringify(appState.blog));
                    localStorage.setItem('demo_categories', JSON.stringify(appState.categories));
                    localStorage.setItem('demo_media_items', JSON.stringify(appState.mediaItems));
                    localStorage.setItem('studio_settings', JSON.stringify(appState.settings));

                    showToast("Database restored successfully!");
                    refreshAllUI();
                    applyStudioSettingsUI();
                } else {
                    showToast("Restoring records to Cloud Firestore...");
                    const batch = fbStore.batch();

                    batch.set(fbStore.collection('settings').doc('profile'), parsed.settings);

                    parsed.customers.forEach(c => batch.set(fbStore.collection('customers').doc(c.id), c));
                    parsed.services.forEach(s => batch.set(fbStore.collection('services').doc(s.id), s));
                    parsed.invoices.forEach(i => batch.set(fbStore.collection('invoices').doc(i.id), i));
                    parsed.quotations.forEach(q => batch.set(fbStore.collection('quotations').doc(q.id), q));
                    if (parsed.enquiries) {
                        parsed.enquiries.forEach(e => batch.set(fbStore.collection('enquiries').doc(e.id), e));
                    }
                    if (parsed.gallery) {
                        parsed.gallery.forEach(g => batch.set(fbStore.collection('gallery').doc(g.id), g));
                    }
                    if (parsed.blog) {
                        parsed.blog.forEach(b => batch.set(fbStore.collection('blog').doc(b.id), b));
                    }
                    if (parsed.categories) {
                        parsed.categories.forEach(c => batch.set(fbStore.collection('categories').doc(c.id), c));
                    }

                    batch.commit()
                        .then(() => showToast("Cloud restoration complete!"))
                        .catch(err => showToast("Cloud write failed: " + err.message, "error"));
                }
            } catch (err) {
                alert("Import failed: " + err.message);
            }
        };
        reader.readAsText(file);
    });

    if (systemResetBtn) systemResetBtn.addEventListener('click', () => {
        const inputPass = prompt("Wipe database warning: Enter Admin password to authorize deletion:");
        if (inputPass !== appState.settings.adminPassword) {
            showToast("Unauthorized. Reset aborted.", "error");
            return;
        }

        const confirmWipe = confirm("This action is absolutely permanent and cannot be undone. Confirm wipe?");
        if (!confirmWipe) return;

        if (appState.dbType === 'demo') {
            localStorage.removeItem('demo_customers');
            localStorage.removeItem('demo_invoices');
            localStorage.removeItem('demo_quotations');
            localStorage.removeItem('demo_enquiries');
            localStorage.removeItem('demo_services');
            localStorage.removeItem('demo_gallery');
            localStorage.removeItem('demo_blog');
            localStorage.removeItem('demo_categories');
            localStorage.removeItem('demo_media_items');
            localStorage.removeItem('studio_settings');
            
            showToast("Factory Reset completed.");
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast("Wiping Cloud collections...");
            const promises = [];
            
            appState.customers.forEach(c => promises.push(fbStore.collection('customers').doc(c.id).delete()));
            appState.invoices.forEach(i => promises.push(fbStore.collection('invoices').doc(i.id).delete()));
            appState.quotations.forEach(q => promises.push(fbStore.collection('quotations').doc(q.id).delete()));
            appState.enquiries.forEach(e => promises.push(fbStore.collection('enquiries').doc(e.id).delete()));
            appState.gallery.forEach(g => promises.push(fbStore.collection('gallery').doc(g.id).delete()));
            appState.blog.forEach(b => promises.push(fbStore.collection('blog').doc(b.id).delete()));

            Promise.all(promises).then(() => {
                fbStore.collection('settings').doc('profile').delete().then(() => {
                    showToast("Cloud Database wiped successfully!");
                    setTimeout(() => location.reload(), 1000);
                });
            }).catch(err => showToast("Wipe failed: " + err.message, "error"));
        }
    });

    // =========================================================================
    // 18. NOTIFICATION ALERTS
    // =========================================================================
    
    const showToast = (message, type = 'success') => {
        toastMessage.textContent = message;
        toastEl.className = `toast ${type}`;
        toastIcon.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 4000);
    };

    // =========================================================================
    // 19. STARTUP BOOTSTRAPPER
    // =========================================================================
    
    // Smart Sticky Header (Hide on Scroll Down, Show on Scroll Up)
    let lastScrollTop = 0;
    const pubHeader = document.getElementById('pub-header');
    if (pubHeader) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scroll Down -> Hide Header
                pubHeader.style.transform = 'translateY(-100%)';
            } else {
                // Scroll Up or at the top -> Show Header
                pubHeader.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        });
    }
    
    const initOfferingsAccordions = () => {
        const cards = document.querySelectorAll('#sec-packages .grid > div');
        cards.forEach((card) => {
            if (card.querySelector('.accordion-content')) return;
            
            const icon = card.querySelector('.w-14.h-14');
            const title = card.querySelector('h3');
            if (!title) return;
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'accordion-content overflow-hidden opacity-0 w-full flex flex-col justify-between';
            wrapper.style.maxHeight = '0px';
            wrapper.style.transition = 'max-height 0.4s ease-in-out, opacity 0.4s ease-in-out';
            
            // Extract everything else
            const children = Array.from(card.childNodes);
            children.forEach(child => {
                if (child !== icon && child !== title && !icon.contains(child) && !title.contains(child)) {
                    wrapper.appendChild(child);
                }
            });
            
            // Clear card and re-assemble
            card.innerHTML = '';
            card.className = 'bg-stone-900 border border-gold-500/10 hover:border-gold-500/30 rounded-sm p-6 flex flex-col justify-start gap-1.5 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold-500/5 group h-full';
            
            if (icon) card.appendChild(icon);
            card.appendChild(title);
            
            // Create toggle button
            const btn = document.createElement('button');
            btn.className = 'view-details-btn mt-2 w-full py-2 bg-stone-950 border border-gold-500/10 hover:border-gold-500/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest rounded-sm transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer';
            btn.innerHTML = `<span>View Details</span> <i class="fa-solid fa-chevron-down text-[8px] transition-transform duration-300"></i>`;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = wrapper.style.maxHeight && wrapper.style.maxHeight !== '0px';
                if (isOpen) {
                    wrapper.style.maxHeight = '0px';
                    wrapper.style.opacity = '0';
                    btn.querySelector('i').style.transform = 'rotate(0deg)';
                    btn.querySelector('span').textContent = 'View Details';
                } else {
                    wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                    wrapper.style.opacity = '1';
                    btn.querySelector('i').style.transform = 'rotate(180deg)';
                    btn.querySelector('span').textContent = 'Hide Details';
                }
            });
            
            card.appendChild(btn);
            card.appendChild(wrapper);
        });
    };

    const initWhyChooseAccordions = () => {
        const cards = document.querySelectorAll('#sec-why-choose .grid > div');
        cards.forEach((card) => {
            if (card.querySelector('.accordion-content')) return;
            
            const detailsDiv = card.querySelector('div:nth-child(2)');
            if (!detailsDiv) return;
            
            const title = detailsDiv.querySelector('h3');
            const desc = detailsDiv.querySelector('p');
            if (!title || !desc) return;
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'accordion-content overflow-hidden opacity-0 w-full';
            wrapper.style.maxHeight = '0px';
            wrapper.style.transition = 'max-height 0.4s ease-in-out, opacity 0.4s ease-in-out';
            
            // Move description into wrapper
            wrapper.appendChild(desc);
            
            // Create toggle button
            const btn = document.createElement('button');
            btn.className = 'view-details-btn mt-2 py-1 px-3 bg-stone-950 border border-gold-500/10 hover:border-gold-500/30 text-gold-400 text-[9px] font-bold uppercase tracking-widest rounded-sm transition duration-300 flex items-center gap-1 cursor-pointer';
            btn.innerHTML = `<span>View Details</span> <i class="fa-solid fa-chevron-down text-[7px] transition-transform duration-300"></i>`;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = wrapper.style.maxHeight && wrapper.style.maxHeight !== '0px';
                if (isOpen) {
                    wrapper.style.maxHeight = '0px';
                    wrapper.style.opacity = '0';
                    btn.querySelector('i').style.transform = 'rotate(0deg)';
                    btn.querySelector('span').textContent = 'View Details';
                } else {
                    wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                    wrapper.style.opacity = '1';
                    btn.querySelector('i').style.transform = 'rotate(180deg)';
                    btn.querySelector('span').textContent = 'Hide Details';
                }
            });
            
            detailsDiv.appendChild(btn);
            detailsDiv.appendChild(wrapper);
        });
    };

    // Gallery and Video Lightbox Logic
    window.openLightbox = (imgUrl, title, desc) => {
        const lightbox = document.getElementById('gallery-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDesc = document.getElementById('lightbox-desc');
        
        if (lightbox && lightboxImg) {
            lightboxImg.src = imgUrl;
            if (lightboxTitle) lightboxTitle.textContent = title || '';
            if (lightboxDesc) lightboxDesc.textContent = desc || '';
            
            lightbox.classList.remove('hidden');
            lightbox.style.display = 'flex';
            
            const startScrollY = window.scrollY;
            const onScrollClose = () => {
                const diff = Math.abs(window.scrollY - startScrollY);
                if (diff > 15) {
                    window.closeLightbox();
                    window.removeEventListener('scroll', onScrollClose);
                }
            };
            window.addEventListener('scroll', onScrollClose);
        }
    };
    
    window.closeLightbox = () => {
        const lightbox = document.getElementById('gallery-lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            lightbox.style.display = 'none';
        }
    };

    window.openVideoLightbox = (videoId, title) => {
        const lightbox = document.getElementById('video-lightbox');
        const container = document.getElementById('video-lightbox-container');
        const titleEl = document.getElementById('video-lightbox-title');
        
        if (lightbox && container) {
            container.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            `;
            if (titleEl) titleEl.textContent = title || '';
            
            lightbox.classList.remove('hidden');
            lightbox.style.display = 'flex';
            
            const startScrollY = window.scrollY;
            const onScrollCloseVideo = () => {
                const diff = Math.abs(window.scrollY - startScrollY);
                if (diff > 15) {
                    window.closeVideoLightbox();
                    window.removeEventListener('scroll', onScrollCloseVideo);
                }
            };
            window.addEventListener('scroll', onScrollCloseVideo);
        }
    };
    
    window.closeVideoLightbox = () => {
        const lightbox = document.getElementById('video-lightbox');
        const container = document.getElementById('video-lightbox-container');
        if (lightbox && container) {
            container.innerHTML = ''; // Stop video playback
            lightbox.classList.add('hidden');
            lightbox.style.display = 'none';
        }
    };

    if (!isAdminPage) {
        initOfferingsAccordions();
        initWhyChooseAccordions();
    }
    
    initApp();
    } catch (err) {
        console.error("Bootstrap error:", err);
        const errContainer = document.createElement('div');
        errContainer.style.position = 'fixed';
        errContainer.style.top = '0';
        errContainer.style.left = '0';
        errContainer.style.width = '100%';
        errContainer.style.background = '#881337';
        errContainer.style.color = '#fda4af';
        errContainer.style.padding = '20px';
        errContainer.style.zIndex = '9999999';
        errContainer.style.fontFamily = 'monospace';
        errContainer.style.fontSize = '14px';
        errContainer.style.borderBottom = '5px solid #f43f5e';
        errContainer.innerHTML = '<strong>Bootstrap Execution Crash:</strong> ' + err.message + '<br><br><strong>Stack Trace:</strong><br>' + (err.stack ? err.stack.replace(/\n/g, '<br>') : 'No stack trace available');
        document.body.appendChild(errContainer);
    }
});
