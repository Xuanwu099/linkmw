/**
 * ============================================================================
 * NIEVE DE LIMÓN — SCRIPT PRINCIPAL
 * ============================================================================
 * Archivo que contiene toda la lógica de interacción del sitio:
 * - Preloader
 * - Copiado de ID al portapapeles
 * - Menú hamburguesa
 * - Filtros de galería y modal de imágenes
 * - Scroll Spy (resaltado del menú según la sección visible)
 * - Conversor de zona horaria para los horarios de Clan Wars
 * - Acordeón de FAQ
 * - Modal de términos y privacidad
 * - Modal de Legal y Fuentes
 * - Base de datos de builds (cargada desde database.json)
 * - Sistema de Tier List con drag & drop y localStorage
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. CONTROL DEL PRELOADER
    // =========================================================================
    const preloader = document.getElementById('preloader');

    function ocultarPreloader() {
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
        }
    }

    window.addEventListener('load', () => {
        setTimeout(ocultarPreloader, 2200);
    });

    setTimeout(ocultarPreloader, 8000);


    // =========================================================================
    // 2. COPIAR ID DEL CLAN AL PORTAPAPELES
    // =========================================================================
    const btnCopiarID = document.getElementById('btn-copiar-id');

    if (btnCopiarID) {
        btnCopiarID.addEventListener('click', () => {
            const idTexto = document.getElementById("clan-id-text").innerText;

            navigator.clipboard.writeText(idTexto).then(() => {
                const toast = document.getElementById('toast');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }).catch(err => {
                console.error('Error al copiar el ID:', err);
            });
        });
    }
    // =========================================================================
    // FUNCIÓN REUTILIZABLE PARA NOTIFICACIONES TOAST
    // =========================================================================
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastText = toast.querySelector('span');
        
        if (toast && toastText) {
            toastText.textContent = message;
            toast.classList.add('show');
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // =========================================================================
    // 3. MENÚ HAMBURGUESA (versión móvil)
    // =========================================================================
    const menuCheckbox = document.getElementById('click');
    const menuBtn = document.querySelector('.menu-btn');

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (menuCheckbox) menuCheckbox.checked = false;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    if (menuCheckbox && menuBtn) {
        menuCheckbox.addEventListener('change', () => {
            menuBtn.setAttribute('aria-expanded', menuCheckbox.checked ? 'true' : 'false');
        });
    }


    // =========================================================================
    // 4. SISTEMA DE FILTROS Y MODAL DE GALERÍA
    // =========================================================================
    const filterButtons = document.querySelectorAll('#galeria .filtro-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const track = document.getElementById('galleryTrack');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const captionText = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const modalLeftArrow = document.querySelector('.modal-left-arrow');
    const modalRightArrow = document.querySelector('.modal-right-arrow');

    let visibleCardsLimit = 6;
    let currentFilter = 'todos';
    let currentImgIndex = 0;

    function getVisibleImages() {
        return Array.from(document.querySelectorAll('.gallery-card:not(.hide)'))
                    .map(card => card.querySelector('img'));
    }

    function filterGallery(category) {
        currentFilter = category;
        let visibleCount = 0;

        galleryCards.forEach(card => {
            const shouldShow = category === 'todos' || card.getAttribute('data-category') === category;

            if (shouldShow && visibleCount < visibleCardsLimit) {
                card.classList.remove('hide');
                card.classList.add('show');
                visibleCount++;
            } else {
                card.classList.remove('show');
                card.classList.add('hide');
            }
        });

        updateLoadMoreButton();
        if (track) track.scrollTo({ left: 0, behavior: 'smooth' });
    }

    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;
        const totalMatching = Array.from(galleryCards).filter(
            c => currentFilter === 'todos' || c.getAttribute('data-category') === currentFilter
        ).length;

        loadMoreBtn.style.display = visibleCardsLimit >= totalMatching ? 'none' : 'inline-flex';
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            visibleCardsLimit = 6;
            filterGallery(button.getAttribute('data-filter'));
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCardsLimit += 3;
            filterGallery(currentFilter);
        });
    }

    if (track && leftArrow && rightArrow) {
        rightArrow.addEventListener('click', () => {
            const visible = document.querySelectorAll('.gallery-card.show');
            if (visible.length) track.scrollBy({ left: visible[0].offsetWidth + 20, behavior: 'smooth' });
        });
        leftArrow.addEventListener('click', () => {
            const visible = document.querySelectorAll('.gallery-card.show');
            if (visible.length) track.scrollBy({ left: -(visible[0].offsetWidth + 20), behavior: 'smooth' });
        });
    }

    function openModal(imgElement) {
        const visibleImages = getVisibleImages();
        currentImgIndex = visibleImages.indexOf(imgElement);
        if (currentImgIndex === -1) currentImgIndex = 0;
        updateModalContent(visibleImages);
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function updateModalContent(visibleImages) {
        if (!visibleImages || !visibleImages.length) return;
        const targetImg = visibleImages[currentImgIndex];
        modalImg.style.opacity = "0";

        setTimeout(() => {
            modalImg.src = targetImg.src;
            modalImg.alt = targetImg.alt;

            const cardInfo = targetImg.closest('.gallery-card').querySelector('.gallery-info, .leader-info');
            captionText.innerHTML = cardInfo ? cardInfo.innerText.trim() : "";
            modalImg.style.opacity = "1";
        }, 150);
    }

    function navigateModal(direction) {
        const visibleImages = getVisibleImages();
        if (!visibleImages.length) return;
        currentImgIndex = (currentImgIndex + direction + visibleImages.length) % visibleImages.length;
        updateModalContent(visibleImages);
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }

    if (track) {
        track.addEventListener('click', (e) => {
            const img = e.target.closest('.gallery-card img');
            if (img) openModal(img);
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === closeBtn) closeModal();
    });

    if (modalRightArrow) modalRightArrow.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(1); });
    if (modalLeftArrow)  modalLeftArrow.addEventListener('click',  (e) => { e.stopPropagation(); navigateModal(-1); });
    
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === "flex") {
            if (e.key === "ArrowRight") navigateModal(1);
            if (e.key === "ArrowLeft")  navigateModal(-1);
            if (e.key === "Escape")     closeModal();
        }
    });

    let touchStartX = 0, touchEndX = 0;
    if (modal) {
        modal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) navigateModal(1);
            if (touchEndX - touchStartX > 50) navigateModal(-1);
        }, { passive: true });
    }

    filterGallery('todos');


    // =========================================================================
    // 5. SCROLL SPY
    // =========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            let currentSectionId = "";

            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 100) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navItems.forEach(item => {
                item.classList.toggle('active', item.getAttribute('href') === `#${currentSectionId}`);
            });
        }, 100);
    });


    // =========================================================================
    // 6. CONVERTIDOR DE ZONA HORARIA
    // =========================================================================
    document.querySelectorAll('.local-time-text').forEach(item => {
        const cdmxHour = parseInt(item.getAttribute('data-cdmx-hour'));
        const now = new Date();

        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        utcDate.setHours(cdmxHour, 0, 0, 0);

        const localTimeStr = utcDate.toLocaleTimeString('es-ES', {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const convertedSpan = item.querySelector('.converted-time');
        if (convertedSpan) convertedSpan.innerText = localTimeStr;
    });


    // =========================================================================
    // 7. FAQ ACORDEÓN
    // =========================================================================
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const btn = item.querySelector('.faq-question');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });

            if (!isActive) {
                faqItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // =========================================================================
    // 8. MODAL DE TÉRMINOS Y PRIVACIDAD
    // =========================================================================
    const termsModal    = document.getElementById('terms-modal');
    const openTermsBtn  = document.getElementById('open-terms');
    const closeTermsBtn = document.getElementById('close-terms-btn');

    function openTermsModal(e) {
        if (e) e.preventDefault();
        termsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (menuCheckbox) menuCheckbox.checked = false;
    }

    function closeTermsModal() {
        termsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openTermsBtn && termsModal) openTermsBtn.addEventListener('click', openTermsModal);
    if (closeTermsBtn && termsModal) {
        closeTermsBtn.addEventListener('click', closeTermsModal);
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) closeTermsModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && termsModal.classList.contains('active')) {
            closeTermsModal();
        }
    });


    // =========================================================================
    // 9. BASE DE DATOS — Builds, Tier List y más
    // =========================================================================

    let SHIPS_DB = [];
    let TIER_CATEGORIES = [];
    let OFFICIAL_TIERLISTS = [];

    const BUILD_META = {
        misiles:        { label:"Misiles",              icon:"fa-rocket" },
        canones:        { label:"Cañones",              icon:"fa-crosshairs" },
        lanzagrandas:   { label:"Lanzagranadas",        icon:"fa-bomb" },
        automaticos:    { label:"Cañones automáticos",  icon:"fa-bullseye" },
        aa:             { label:"Defensa AA",           icon:"fa-shield-halved" },
        torpedos:       { label:"Torpedos",             icon:"fa-fish" },
        aviones:        { label:"Aviación",             icon:"fa-plane" },
        helicopteros:   { label:"Helicópteros",         icon:"fa-helicopter" },
        usv:            { label:"No tripuladas",        icon:"fa-ship" }
    };

    // Tabs del panel de Base de Datos
    document.querySelectorAll('.db-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.db-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('panel-recomendaciones').classList.toggle('hidden-panel', tab.dataset.dbtab !== 'recomendaciones');
            document.getElementById('panel-tierlist').classList.toggle('hidden-panel', tab.dataset.dbtab !== 'tierlist');
        });
    });

    const shipsGrid  = document.getElementById('shipsGrid');
    const helicoptersSection = document.getElementById('helicoptersSection');
    let currentShipClass = 'fragata';

    // Req 4: Filtrar estrictamente las recomendaciones permitidas
    const ALLOWED_RECOMMENDATIONS = [
        'f110', 'smart4000', 'cstp', 'rusich', '126', // Fragatas
        'ushakov', 'spruance', 'zumwalt', 'basisty', // Destructores
        'arkansas', 'shiloh', // Cruceros
        'hood', 'rodney', // Acorazados
        'enterprise', 'type076', 'type004', // Portaaviones
        'type071', // Otros
        'S5', 'type039', // Submarinos
        'blackghost', 'fenice', 'comanche', 'mi171', 'z20' // Helicópteros
    ];

    /**
     * Renderiza las tarjetas de buques en la sección de Recomendaciones.
     * Muestra el campo "recomendadoPor" de forma INDIVIDUAL (solo si existe en el JSON).
     */
    function renderShips() {
        if (!shipsGrid) return;

        if (currentShipClass === 'helicoptero') {
            shipsGrid.innerHTML = '';
            if (helicoptersSection) helicoptersSection.classList.remove('hidden-panel');
        } else {
            if (helicoptersSection) helicoptersSection.classList.add('hidden-panel');
        }

        const lista = SHIPS_DB.filter(s =>
            ALLOWED_RECOMMENDATIONS.includes(s.id) &&
            (currentShipClass === '' || s.clase === currentShipClass)
        );

        shipsGrid.innerHTML = lista.length ? lista.map(s => {
            let buildHtml = '';
            if (s.clase === 'helicoptero') {
                buildHtml = `<li><i class="fas fa-info-circle"></i><span><strong>Destaca en:</strong> ${s.uso || 'No especificado'}</span></li>`;
            } else {
                buildHtml = Object.entries(s.build || {}).map(([k,v]) => `
                    <li><i class="fas ${(BUILD_META[k] || {icon:'fa-cube'}).icon}"></i>
                        <span><strong>${(BUILD_META[k] || {label:k}).label}:</strong> ${v}</span>
                    </li>`).join("");
            }

            // Mostrar "Recomendado por" SOLO si el buque tiene el campo recomendadoPor en el JSON
            const recommendedByHtml = s.recomendadoPor 
                ? `<div class="ship-recommended-by">
                       <i class="fas fa-user-shield"></i>
                       <span>Recomendado por: <strong>${s.recomendadoPor}</strong></span>
                   </div>`
                : '';

            return `
            <article class="ship-card">
                <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.onerror=null;this.src='fallback-image.jpg';">
                <span class="ship-class-badge">${s.clase}</span>
                <h3>${s.name}</h3>
                <ul class="build-list">
                    ${buildHtml}
                </ul>
                ${recommendedByHtml}
            </article>`;
        }).join("") : `<p class="db-empty">Sin resultados para esa búsqueda.</p>`;
    }

    document.querySelectorAll('[data-shipclass]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-shipclass]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShipClass = btn.dataset.shipclass;
            renderShips();
        });
    });

    // =========================================================================
    // SISTEMA DE TIER LIST — DISEÑO CON 3 VISTAS (Fijadas, Mis Listas, Crear)
    // =========================================================================
    const TIERS = ["SS","S","A","B","C","D","NA"];
    const tierBoard      = document.getElementById('tierBoard');
    const tierPool       = document.getElementById('tierPool');
    const panelTierlist  = document.getElementById('panel-tierlist');

    let currentCat  = 'fragata'; // Categoría por defecto
    let placements  = {};
    let order       = {};
    let drafts      = {};

    // --- Navegación entre las 3 vistas principales ---
    document.querySelectorAll('.tier-main-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tier-main-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tier-view').forEach(v => v.classList.remove('active-view'));
            const viewId = 'view-' + tab.dataset.maintab;
            const view = document.getElementById(viewId);
            if (view) view.classList.add('active-view');
            
            // Renderizar contenido según la vista
            if (tab.dataset.maintab === 'fijadas') {
                renderFijadasView();
            } else if (tab.dataset.maintab === 'mislistas') {
                renderMisListasView();
            } else if (tab.dataset.maintab === 'crear') {
                renderCrearSubTabs();
                renderTierBoard();
            }
        });
    });

    // --- Sub-pestañas de categorías en "Tierlist Fijadas" ---
    document.getElementById('fijadasSubTabs')?.addEventListener('click', e => {
        const btn = e.target.closest('.tier-sub-tab');
        if (!btn) return;
        document.querySelectorAll('#fijadasSubTabs .tier-sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFijadasView(btn.dataset.subcat);
    });

    // --- Sub-pestañas de categorías en "Crea tu Tierlist" ---
    document.getElementById('crearSubTabs')?.addEventListener('click', e => {
        const btn = e.target.closest('.tier-sub-tab');
        if (!btn) return;
        
        // Guardar estado actual antes de cambiar de categoría
        drafts[currentCat] = { placements: { ...placements }, order: JSON.parse(JSON.stringify(order)) };
        
        document.querySelectorAll('#crearSubTabs .tier-sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentCat = btn.dataset.subcat;
        const draft = drafts[currentCat] || { placements: {}, order: {} };
        placements = { ...draft.placements };
        order = JSON.parse(JSON.stringify(draft.order));
        
        renderTierBoard();
    });

    // --- Renderizar sub-pestañas de "Crea tu Tierlist" ---
    function renderCrearSubTabs() {
        const container = document.getElementById('crearSubTabs');
        if (!container) return;
        
        container.innerHTML = TIER_CATEGORIES.map(c => `
            <button class="tier-sub-tab ${c.id === currentCat ? 'active' : ''}" data-subcat="${c.id}">${c.label}</button>
        `).join("");
    }

    // --- Renderizar Vista: Tierlist Fijadas (acordeón) ---
    function renderFijadasView(categoryFilter = null) {
        const container = document.getElementById('fijadasContainer');
        if (!container) return;
        
        const activeSubTab = document.querySelector('#fijadasSubTabs .tier-sub-tab.active');
        const catFilter = categoryFilter || (activeSubTab ? activeSubTab.dataset.subcat : null);
        
        const allLists = [...OFFICIAL_TIERLISTS, ...getSavedLists().filter(l => l.pinned)];
        const filteredLists = catFilter 
            ? allLists.filter(l => l.cat === catFilter)
            : allLists;
        
        if (filteredLists.length === 0) {
            container.innerHTML = '<p class="db-empty">No hay listas fijadas para esta categoría.</p>';
            return;
        }
        
        container.innerHTML = filteredLists.map(list => {
            const catInfo = TIER_CATEGORIES.find(c => c.id === list.cat);
            const catLabel = catInfo ? catInfo.label : list.cat;
            
            // Construir filas de tiers
            const tiersHtml = TIERS.map(t => {
                const itemsInTier = [];
                const tierOrder = list.order && list.order[t] ? list.order[t] : [];
                
                // Usar el orden guardado si existe
                if (tierOrder.length > 0) {
                    tierOrder.forEach(id => {
                        const ship = SHIPS_DB.find(s => s.id === id && s.clase === list.cat);
                        if (ship) itemsInTier.push(ship);
                    });
                } else {
                    // Fallback: sin orden específico
                    SHIPS_DB.filter(s => s.clase === list.cat && list.placements[s.id] === t)
                        .forEach(s => itemsInTier.push(s));
                }
                
                const chipsHtml = itemsInTier.map(s => `
                    <div class="tier-accordion-chip">
                        ${s.img ? `<img src="${s.img}" alt="${s.name}" onerror="this.style.display='none'">` : '<i class="fas fa-cube"></i>'}
                        <span>${s.name}</span>
                    </div>
                `).join("");
                
                return `
                <div class="tier-accordion-row">
                    <div class="tier-accordion-label tier-${t}">${t}</div>
                    <div class="tier-accordion-items">${chipsHtml || '<span style="color: var(--texto-gris); font-size: 0.75rem; padding: 10px;">Vacío</span>'}</div>
                </div>`;
            }).join("");
            
                        return `
            <div class="tier-list-card ${list.official ? 'official' : ''}" data-listid="${list.id}">
                <div class="tier-list-header" onclick="toggleTierListCard(this)">
                    <div class="tier-list-title">
                        <i class="fas fa-thumbtack"></i>
                        <h4>${list.name}</h4>
                        ${list.official ? '<span class="official-badge-small">OFICIAL</span>' : ''}
                        
                    </div>
                    <div class="tier-list-actions">
                        ${list.official ? `
                            <button onclick="event.stopPropagation(); copyOfficialList('${list.id}')" title="Copiar para editar">
                                <i class="fas fa-copy"></i>
                            </button>
                        ` : `
                            <button onclick="event.stopPropagation(); togglePinList(${list.id})" class="${list.pinned ? 'pinned-on' : ''}" title="Fijar/Desfijar">
                                <i class="fas fa-thumbtack"></i>
                            </button>
                            <button onclick="event.stopPropagation(); loadUserList(${list.id})" title="Cargar para editar">
                                <i class="fas fa-folder-open"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteUserList(${list.id})" class="danger" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        `}
                        <i class="fas fa-chevron-down tier-list-toggle"></i>
                    </div>
                </div>
                <div class="tier-list-body">
                    ${tiersHtml}
                </div>
            </div>`;
        }).join("");
    }

    // --- Toggle de acordeón ---
    window.toggleTierListCard = function(headerEl) {
        const card = headerEl.closest('.tier-list-card');
        card.classList.toggle('expanded');
    };

    // --- Renderizar Vista: Mis Listas ---
    function renderMisListasView() {
        const container = document.getElementById('mislistasContainer');
        if (!container) return;
        
        const lists = getSavedLists();
        
        if (lists.length === 0) {
            container.innerHTML = '<p class="db-empty">Aún no has guardado ninguna lista. Ve a "Crea tu Tierlist" para empezar.</p>';
            return;
        }
        
        container.innerHTML = lists.map(list => {
            const catInfo = TIER_CATEGORIES.find(c => c.id === list.cat);
            const catLabel = catInfo ? catInfo.label : list.cat;
            const totalItems = Object.keys(list.placements).length;
            
            return `
            <div class="mislistas-card">
                <div class="tier-list-header" onclick="toggleTierListCard(this)">
                    <div class="tier-list-title">
                        <i class="fas fa-save"></i>
                        <h4>${list.name}</h4>
                        
                    </div>
                    <div class="tier-list-actions">
                        <button onclick="event.stopPropagation(); togglePinList(${list.id})" class="${list.pinned ? 'pinned-on' : ''}" title="Fijar/Desfijar">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button onclick="event.stopPropagation(); loadUserList(${list.id})" title="Cargar para editar">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteUserList(${list.id})" class="danger" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <i class="fas fa-chevron-down tier-list-toggle"></i>
                    </div>
                </div>
                <div class="tier-list-body">
                    ${TIERS.map(t => {
                        const itemsInTier = [];
                        const tierOrder = list.order && list.order[t] ? list.order[t] : [];
                        
                        if (tierOrder.length > 0) {
                            tierOrder.forEach(id => {
                                const ship = SHIPS_DB.find(s => s.id === id && s.clase === list.cat);
                                if (ship) itemsInTier.push(ship);
                            });
                        } else {
                            SHIPS_DB.filter(s => s.clase === list.cat && list.placements[s.id] === t)
                                .forEach(s => itemsInTier.push(s));
                        }
                        
                        const chipsHtml = itemsInTier.map(s => `
                            <div class="tier-accordion-chip">
                                ${s.img ? `<img src="${s.img}" alt="${s.name}" onerror="this.style.display='none'">` : '<i class="fas fa-cube"></i>'}
                                <span>${s.name}</span>
                            </div>
                        `).join("");
                        
                        return `
                        <div class="tier-accordion-row">
                            <div class="tier-accordion-label tier-${t}">${t}</div>
                            <div class="tier-accordion-items">${chipsHtml || '<span style="color: var(--texto-gris); font-size: 0.75rem; padding: 10px;">Vacío</span>'}</div>
                        </div>`;
                    }).join("")}
                </div>
            </div>`;
        }).join("");
    }

    // --- Acciones sobre listas de usuario ---
    window.togglePinList = function(id) {
        let lists = getSavedLists();
        const list = lists.find(l => l.id === id);
        if (!list) return;
        
        const userPinned = lists.filter(l => l.pinned).length;
        if (!list.pinned && userPinned >= 3) {
            alert('Máximo 3 listas fijadas. Desfija una primero.');
            return;
        }
        list.pinned = !list.pinned;
        setSavedLists(lists);
        renderMisListasView();
    };

    window.loadUserList = function(id) {
        const lists = getSavedLists();
        const list = lists.find(l => l.id === id);
        if (!list) return;
        
        // Cambiar a vista "Crea tu Tierlist"
        document.querySelectorAll('.tier-main-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-maintab="crear"]').classList.add('active');
        document.querySelectorAll('.tier-view').forEach(v => v.classList.remove('active-view'));
        document.getElementById('view-crear').classList.add('active-view');
        
        currentCat = list.cat;
        placements = { ...list.placements };
        order = list.order ? JSON.parse(JSON.stringify(list.order)) : {};
        drafts[currentCat] = { placements: { ...placements }, order: JSON.parse(JSON.stringify(order)) };
        
        renderCrearSubTabs();
        renderTierBoard();
    };

    window.deleteUserList = function(id) {
        if (!confirm('¿Eliminar esta lista?')) return;
        let lists = getSavedLists().filter(l => l.id !== id);
        setSavedLists(lists);
        renderMisListasView();
    };
    // --- Copiar lista oficial para editar ---
    window.copyOfficialList = function(id) {
        const officialList = OFFICIAL_TIERLISTS.find(l => l.id === id);
        if (!officialList) return;

        // Crear una copia de la lista
        const newList = {
            id: Date.now(),
            name: `${officialList.name} (Copia)`,
            cat: officialList.cat,
            placements: JSON.parse(JSON.stringify(officialList.placements)),
            order: JSON.parse(JSON.stringify(officialList.order)),
            pinned: true, // Se fija automáticamente al copiarla
            official: false
        };

        // Guardar en localStorage
        const lists = getSavedLists();
        lists.push(newList);
        setSavedLists(lists);

        // Cambiar a la vista "Crea tu Tierlist" y cargar la copia
        document.querySelectorAll('.tier-main-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-maintab="crear"]').classList.add('active');
        document.querySelectorAll('.tier-view').forEach(v => v.classList.remove('active-view'));
        document.getElementById('view-crear').classList.add('active-view');

        currentCat = newList.cat;
        placements = { ...newList.placements };
        order = JSON.parse(JSON.stringify(newList.order));
        drafts[currentCat] = { placements: { ...placements }, order: JSON.parse(JSON.stringify(order)) };

        renderCrearSubTabs();
        renderTierBoard();
        
        // Notificación visual tipo Toast (reemplaza al alert)
        showToast('✅ Lista copiada a "Mis Listas" y disponible para editar');
    };

    // --- Renderizar tablero de tiers (para "Crea tu Tierlist") ---
    function itemsForCategory(catId) {
        const cat = TIER_CATEGORIES.find(c => c.id === catId);
        if (!cat) return [];
        return SHIPS_DB.filter(s => s.clase === catId).map(s => ({ id:s.id, name:s.name, img:s.img }));
    }

    function tierChip(it) {
        return `<div class="tier-chip" data-item="${it.id}" draggable="true">
            ${it.img ? `<img src="${it.img}" alt="" draggable="false" onerror="this.remove()">` : `<i class="fas fa-cube"></i>`}
            <span>${it.name}</span>
        </div>`;
    }

    function renderTierBoard() {
        if (!tierBoard || !tierPool) return;

        const items = itemsForCategory(currentCat);

        tierBoard.innerHTML = TIERS.map(t => {
            const tierItems = items.filter(it => placements[it.id] === t);
            const orderedItems = order[t] 
                ? order[t].map(id => tierItems.find(it => it.id === id)).filter(Boolean)
                : tierItems;
            
            return `
            <div class="tier-row">
                <div class="tier-label tier-${t}">${t}</div>
                <div class="tier-items" data-tier="${t}">${orderedItems.map(tierChip).join("")}</div>
            </div>`;
        }).join("");

        const poolItems = items.filter(it => !placements[it.id]);
        tierPool.innerHTML = poolItems.length 
            ? poolItems.map(tierChip).join("")
            : '<span class="db-empty">Pool vacío.</span>';
    }

    // --- Drag & Drop (solo para "Crea tu Tierlist") ---
    let draggedItem = null;

    panelTierlist?.addEventListener('dragstart', e => {
        // Solo activar drag en la vista "crear"
        const crearView = document.getElementById('view-crear');
        if (!crearView.classList.contains('active-view')) return;
        
        const chip = e.target.closest('.tier-chip');
        if (!chip) return;
        
        draggedItem = chip.dataset.item;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedItem);
        setTimeout(() => chip.classList.add('dragging'), 0);
    });

    panelTierlist?.addEventListener('dragend', () => {
        draggedItem = null;
        document.querySelectorAll('.tier-chip.dragging').forEach(c => c.classList.remove('dragging'));
        document.querySelectorAll('.drag-over').forEach(z => z.classList.remove('drag-over'));
    });

    panelTierlist?.addEventListener('dragover', e => {
        const crearView = document.getElementById('view-crear');
        if (!crearView.classList.contains('active-view')) return;
        
        const zone = e.target.closest('.tier-items, .tier-pool-items');
        if (!zone || !draggedItem) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = getDragAfterElement(zone, e.clientX, e.clientY);
        const draggable = document.querySelector('.tier-chip.dragging');
        
        if (!draggable) return;
        
        if (afterElement == null) {
            zone.appendChild(draggable);
        } else {
            zone.insertBefore(draggable, afterElement);
        }
    });

    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.tier-chip:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offsetX = x - box.left - box.width / 2;
            const offsetY = Math.abs(y - (box.top + box.height / 2));
            
            if (offsetX < 0) {
                const distance = Math.hypot(offsetX, offsetY);
                if (!closest.element || distance < closest.distance) {
                    return { distance, element: child };
                }
            }
            return closest;
        }, { distance: Number.POSITIVE_INFINITY, element: null }).element;
    }

    panelTierlist?.addEventListener('drop', e => {
        const crearView = document.getElementById('view-crear');
        if (!crearView.classList.contains('active-view')) return;
        
        const zone = e.target.closest('.tier-items, .tier-pool-items');
        if (!zone) return;
        e.preventDefault();

        const id = e.dataTransfer.getData('text/plain') || draggedItem;
        if (!id) return;

        const tier = zone.dataset.tier;
        
        if (tier) {
            placements[id] = tier;
        } else {
            delete placements[id];
        }

        if (tier && !order[tier]) order[tier] = [];
        const chipsInZone = [...zone.querySelectorAll('.tier-chip')];
        if (tier) {
            order[tier] = chipsInZone.map(chip => chip.dataset.item);
        }

        renderTierBoard();
    });

    // --- Gestión de listas guardadas en localStorage ---
    function getSavedLists() {
        try { return JSON.parse(localStorage.getItem('ndl_tierlists') || '[]'); }
        catch { return []; }
    }

    function setSavedLists(l) {
        localStorage.setItem('ndl_tierlists', JSON.stringify(l));
    }

    document.getElementById('saveTierBtn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('tierListName');
        const catLabel = TIER_CATEGORIES.find(c => c.id === currentCat)?.label || currentCat;

        const name = (nameInput?.value || '').trim() || `Lista ${catLabel} — ${new Date().toLocaleDateString()}`;

        const lists = getSavedLists();
        lists.push({
            id: Date.now(),
            name,
            cat: currentCat,
            placements: { ...placements },
            order: JSON.parse(JSON.stringify(order)),
            pinned: false
        });

        setSavedLists(lists);
        if (nameInput) nameInput.value = '';
        alert('¡Lista guardada exitosamente!');
    });

    document.getElementById('resetTierBtn')?.addEventListener('click', () => {
        if (!confirm('¿Reiniciar el tablero actual?')) return;
        placements = {};
        order = {};
        drafts[currentCat] = { placements: {}, order: {} };
        renderTierBoard();
    });

    // --- Generar listas fijadas iniciales con todas las categorías (SS, S, A, B, C, D, NA) ---
    function generateInitialTierlists(db) {
        const destroyers = db.filter(s => s.clase === 'destructor').map(s => s.id);
        const carriers = db.filter(s => s.clase === 'portaaviones').map(s => s.id);
        const frigates = db.filter(s => s.clase === 'fragata').map(s => s.id);
        const cruisers = db.filter(s => s.clase === 'crucero').map(s => s.id);
        const battleships = db.filter(s => s.clase === 'acorazado').map(s => s.id);
        const submarines = db.filter(s => s.clase === 'submarino').map(s => s.id);
        const others = db.filter(s => s.clase === 'otros').map(s => s.id);

        // --- DESTRUCTORES ---
        const des_SS = ['055G', 'shkval', 'johnson', 'choe', 'ningbo', 'fletcher'];
        const des_S = ['spruance', 'ushakov', 'basisty', 'sriwijaya','ddgx','dazhou', 'chabanenko', 'shenzhen', 'anchar', 'type83', 'dongguan'];
        const des_A = ['zumwalt', 'hangzhou', 'kylin', 'ddx','ashigara'];
        const des_B = [ 'chengying', 'smart8000', 'defender', 'akizuki', 'jss', 'visakhapatnam', 'maya', 'project2145', 'lider','jacklucas','monsoor','constitution','hobart'];
        const des_C = ['oceanavenger', 'combatant', 'tf2000', 'swordship','paladin'];
        const des_D = ['type058', 'jeongjo', 'tedstevens'];
        // CORREGIDO: Ahora filtra B y C también para no enviarlos a N/A por error
        const des_rest = destroyers.filter(id => !des_SS.includes(id) && !des_S.includes(id) && !des_A.includes(id) && !des_B.includes(id) && !des_C.includes(id) && !des_D.includes(id));

        // --- PORTAAVIONES ---
        const car_SS = ['nemesis'];
        const car_S = ['evolved', 'midway', 'charles', 'ghost', 'enterprise'];
        const car_A = ['izumo', 'type076', 'pang', 'typhoon', 'type004'];
        const car_B = ['america', 'cvx', 'project1143e', 'tianjin', 'trieste', 'ulyanovsk', 'vikrant', 'zuikaku'];
        const car_C = ['chixiao'];
        const car_D = ['hyuga'];
        const car_rest = carriers.filter(id => !car_SS.includes(id) && !car_S.includes(id) && !car_A.includes(id) && !car_B.includes(id) && !car_C.includes(id) && !car_D.includes(id));

        // --- FRAGATAS ---
        const fri_SS = ['type32', 'fremmevo', 'hexxeres'];
        const fri_S = ['smart4000', '126', 'blueshark', '30DX', 'forbin', '124', 'aquitaine', 'normadie'];
        const fri_A = ['rusich', 'f110'];
        const fri_B = ['nilgiri', 'type054b', 'glasgow', '127'];
        const fri_C = ['project22350', 'batch3', 'gorshkov', 'mogami', 'cstp'];
        const fri_D = ['125'];
        // CORREGIDO: Ahora filtra D también para no enviarlo a N/A por error
        const fri_rest = frigates.filter(id => !fri_SS.includes(id) && !fri_S.includes(id) && !fri_A.includes(id) && !fri_B.includes(id) && !fri_C.includes(id) && !fri_D.includes(id));

        // --- CRUCEROS ---
        const cru_SS = ['liren', 'boston','amagi'];
        const cru_S = ['graf', 'defiant', 'california', 'arkansas', 'arsenal', 'shiloh'];
        const cru_A = ['svarog', 'isakov'];
        const cru_B = ['nahimov', 'ifcx260', 'veliky', 'vladivostok', 'geobukseon', 'kirov'];
        const cru_C = ['ibuki', 'grau', 'battlecruiser', 'shiyan', 'vittorio']; 
        const cru_D = ['CGX21', 'vella', 'jeanne'];
        const cru_rest = cruisers.filter(id => !cru_SS.includes(id) && !cru_S.includes(id) && !cru_A.includes(id) && !cru_B.includes(id) && !cru_C.includes(id) && !cru_D.includes(id));

        // --- ACORAZADOS ---
        const bb_SS = ['tirpitz', 'hood', 'rodney', 'alsace'];
        const bb_S = ['kronshtadt', 'moscow', 'richelieu', 'sawtooth'];
        const bb_A = ['hampshire','montana'];
        const bb_B = ['huaqing', 'iowa', 'mushashi', 'bismarck', 'yamatoaegis'];
        const bb_C = ['massa', 'nusantara'];
        const bb_D = ['missouri', 'teton', 'tamato'];
        const bb_rest = battleships.filter(id => !bb_SS.includes(id) && !bb_S.includes(id) && !bb_A.includes(id) && !bb_B.includes(id) && !bb_C.includes(id) && !bb_D.includes(id));

        // --- SUBMARINOS ---
        const sub_SS = ['S5', 'type039', 'vanguard']; 
        const sub_S = ['jangyeong', 'straj', 'dmitry', 'ohio'];
        const sub_A = ['triomphant', 'type094'];
        const sub_B = ['taigei', 'smx25'];
        const sub_C = ['smx31', 'columbia'];
        const sub_D = ['izanami', 'belgorod'];
        const sub_rest = submarines.filter(id => !sub_SS.includes(id) && !sub_S.includes(id) && !sub_A.includes(id) && !sub_B.includes(id) && !sub_C.includes(id) && !sub_D.includes(id));
        
        // --- OTROS ---
        const oth_SS = ['type071'];
        const oth_S = ['sanantonio', 'vladimirandreev'];
        const oth_A = [];
        const oth_B = ['chang', 'dx125'];
        const oth_C = ['07x', 'project1239', 'zeus'];
        const oth_D = ['fearless', 'katori', 'bahia'];
        // CORREGIDO: Ahora filtra D también para no enviarlo a N/A por error
        const oth_rest = others.filter(id => !oth_SS.includes(id) && !oth_S.includes(id) && !oth_A.includes(id) && !oth_B.includes(id) && !oth_C.includes(id) && !oth_D.includes(id));

        // =================================================================
        // FUNCIÓN AUXILIAR: Asigna todo el "resto" no clasificado a N/A
        // =================================================================
        const assignRest = (ids) => {
            const placements = {};
            const order = { NA: [] }; 
            ids.forEach(id => {
                placements[id] = 'NA';
                order.NA.push(id);
            });
            return { placements, order };
        };

        // =================================================================
        // FUNCIÓN CONSTRUCTORA: Procesa todos los tiers + NA
        // =================================================================
        const buildList = (ss, s, a, b, c, d, rest) => {
            const data = assignRest(rest);
            const placements = { ...data.placements };
            const order = { ...data.order };

            ss.forEach(id => { placements[id] = 'SS'; order.SS = order.SS || []; order.SS.push(id); });
            s.forEach(id => { placements[id] = 'S'; order.S = order.S || []; order.S.push(id); });
            a.forEach(id => { placements[id] = 'A'; order.A = order.A || []; order.A.push(id); });
            b.forEach(id => { placements[id] = 'B'; order.B = order.B || []; order.B.push(id); });
            c.forEach(id => { placements[id] = 'C'; order.C = order.C || []; order.C.push(id); });
            d.forEach(id => { placements[id] = 'D'; order.D = order.D || []; order.D.push(id); });
            
            return { placements, order };
        };

        // CORREGIDO: Se pasan TODOS los arrays (incluyendo B, C y D) a buildList
        const des = buildList(des_SS, des_S, des_A, des_B, des_C, des_D, des_rest);
        const car = buildList(car_SS, car_S, car_A, car_B, car_C, car_D, car_rest);
        const fri = buildList(fri_SS, fri_S, fri_A, fri_B, fri_C, fri_D, fri_rest);
        const cru = buildList(cru_SS, cru_S, cru_A, cru_B, cru_C, cru_D, cru_rest);
        const bb = buildList(bb_SS, bb_S, bb_A, bb_B, bb_C, bb_D, bb_rest);
        const sub = buildList(sub_SS, sub_S, sub_A, sub_B, sub_C, sub_D, sub_rest);
        const oth = buildList(oth_SS, oth_S, oth_A, oth_B, oth_C, oth_D, oth_rest);

        return [
            { id: "oficial-frigate", name: "Fragatas — NDL", cat: "fragata", official: true, placements: fri.placements, order: fri.order },
            { id: "oficial-destroyer", name: "Destructores — NDL", cat: "destructor", official: true, placements: des.placements, order: des.order },
            { id: "oficial-cruiser", name: "Cruceros — NDL", cat: "crucero", official: true, placements: cru.placements, order: cru.order },
            { id: "oficial-battleship", name: "Acorazados — NDL", cat: "acorazado", official: true, placements: bb.placements, order: bb.order },
            { id: "oficial-carrier", name: "Portaaviones — NDL", cat: "portaaviones", official: true, placements: car.placements, order: car.order },
            { id: "oficial-submarine", name: "Submarinos — NDL", cat: "submarino", official: true, placements: sub.placements, order: sub.order },
            { id: "oficial-others", name: "Otros — NDL", cat: "otros", official: true, placements: oth.placements, order: oth.order }
        ];
    }

    async function loadDatabase() {
        try {
            const res = await fetch('database.json?v=' + Date.now());
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();

            if (data.ships) SHIPS_DB = data.ships;
            if (data.categories) TIER_CATEGORIES = data.categories;
            
            OFFICIAL_TIERLISTS = generateInitialTierlists(SHIPS_DB);

        } catch (err) {
            console.warn('database.json no disponible; usando datos integrados como respaldo.', err);
            OFFICIAL_TIERLISTS = generateInitialTierlists(SHIPS_DB);
        }

        if (!TIER_CATEGORIES.some(c => c.id === currentCat)) {
            currentCat = TIER_CATEGORIES.length ? TIER_CATEGORIES[0].id : 'fragata';
        }

        document.querySelectorAll('.db-loading').forEach(el => el.remove());

        renderShips();
        
        // Renderizar vista inicial de Tier List (Fijadas)
        renderFijadasView('fragata');
        renderCrearSubTabs();
    }

    loadDatabase();


    // =========================================================================
    // 10. MODAL DE LEGAL Y FUENTES
    // =========================================================================
    const legalModal    = document.getElementById('legal-modal');
    const openLegalBtn  = document.getElementById('open-legal');
    const closeLegalBtn = document.getElementById('close-legal-btn');

    function openLegalModal(e) {
        if (e) e.preventDefault();
        legalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (menuCheckbox) menuCheckbox.checked = false;
    }

    function closeLegalModal() {
        legalModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openLegalBtn && legalModal) openLegalBtn.addEventListener('click', openLegalModal);
    
    if (closeLegalBtn && legalModal) {
        closeLegalBtn.addEventListener('click', closeLegalModal);
        legalModal.addEventListener('click', (e) => {
            if (e.target === legalModal) closeLegalModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal.classList.contains('active')) {
            closeLegalModal();
        }
    });

});
