/**
 * script.js - Logique de bascule Inaccessible <-> Accessible
 * 
 * Gère la manipulation du DOM pour transformer les erreurs d'accessibilité en code conforme.
 */

let isAccessible = false;

// Fonction principale de bascule
function toggleAccessibility() {
    isAccessible = !isAccessible;
    
    // Modification de la classe body pour le CSS (Contraste, Focus, Mobile)
    const body = document.body;
    body.className = isAccessible ? 'accessible' : 'inaccessible';

    // ==========================================
    // 1. SÉMANTIQUE ET STRUCTURE
    // ==========================================
    replaceTagById('header', isAccessible ? 'header' : 'div');
    replaceTagById('nav', isAccessible ? 'nav' : 'div');
    replaceTagById('main', isAccessible ? 'main' : 'div');
    replaceTagById('footer', isAccessible ? 'footer' : 'div');
    
    replaceTagById('main-title', isAccessible ? 'h1' : 'div');
    if (isAccessible) {
        document.getElementById('main-title').innerHTML = 'Réservez vos pires vacances'; // Retrait du <b>
    } else {
        document.getElementById('main-title').innerHTML = '<b>Réservez vos pires vacances</b>';
    }

    // Correction de la hiérarchie des titres (saut de H2 à H4 corrigé)
    const sections = ['section-title', 'form-title', 'table-title', 'faq-title'];
    sections.forEach(id => {
        replaceTagById(id, isAccessible ? 'h2' : 'h4');
    });

    // ==========================================
    // 3. MÉDIAS
    // ==========================================
    const decoImg = document.getElementById('deco-img');
    const infoImg = document.getElementById('info-img');
    const userBtn = document.getElementById('user-btn');
    
    if (isAccessible) {
        decoImg.setAttribute('alt', ''); // Image décorative : alt vide (ignorée par lecteurs d'écran)
        infoImg.setAttribute('alt', 'Chambre d\'hôtel vétuste avec vue sur un mur de briques'); // Image info : alt pertinent
        userBtn.setAttribute('aria-label', 'Mon espace utilisateur'); // Bouton icône : aria-label
    } else {
        decoImg.setAttribute('alt', 'jolie vague de fond très bleue qui nous rappelle l\'océan'); // Alt polluant
        infoImg.removeAttribute('alt'); // Pas d'alt du tout
        userBtn.removeAttribute('aria-label');
    }

    // ==========================================
    // 4. NAVIGATION AU CLAVIER & 6. ARIA
    // ==========================================
    const nav = document.getElementById('nav');
    if (isAccessible) {
        nav.removeAttribute('aria-hidden'); // Rendu visible aux lecteurs d'écran
    } else {
        nav.setAttribute('aria-hidden', 'true'); // Erreur fatale : navigation cachée
    }

    // Faux bouton (div vs button)
    if (isAccessible) {
        replaceTagById('fake-btn', 'button');
        document.getElementById('fake-btn').removeAttribute('tabindex');
    } else {
        replaceTagById('fake-btn', 'div');
        document.getElementById('fake-btn').setAttribute('tabindex', '0'); // Pas de gestion "Enter" par défaut
    }
    bindFakeBtn(); // Re-lier l'événement click/clavier après remplacement du tag

    // Notification dynamique (aria-live)
    const notifArea = document.getElementById('notification-area');
    if (isAccessible) {
        notifArea.setAttribute('aria-live', 'polite'); // Lu par le lecteur d'écran
    } else {
        notifArea.removeAttribute('aria-live'); // Reste muet
    }

    // ==========================================
    // 5. FORMULAIRES ET TABLEAUX
    // ==========================================
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (isAccessible) {
        // Suppression des tabindex chaotiques
        nameInput.removeAttribute('tabindex');
        emailInput.removeAttribute('tabindex');
        
        // Ajout des vrais <label>
        if (!document.getElementById('label-name')) {
            const labelName = document.createElement('label');
            labelName.id = 'label-name';
            labelName.setAttribute('for', 'name');
            labelName.textContent = 'Nom complet';
            nameInput.parentNode.insertBefore(labelName, nameInput);
            
            const labelEmail = document.createElement('label');
            labelEmail.id = 'label-email';
            labelEmail.setAttribute('for', 'email');
            labelEmail.textContent = 'Adresse email';
            emailInput.parentNode.insertBefore(labelEmail, emailInput);
        }
        
        // Regroupement sémantique des cases à cocher
        replaceTagById('options-group', 'fieldset');
        replaceTagById('options-legend', 'legend');
        
    } else {
        // Retour aux tabindex chaotiques
        nameInput.setAttribute('tabindex', '2');
        emailInput.setAttribute('tabindex', '1');
        
        // Suppression des labels (retour au placeholder seul)
        const ln = document.getElementById('label-name');
        if (ln) ln.remove();
        const le = document.getElementById('label-email');
        if (le) le.remove();
        
        replaceTagById('options-group', 'div');
        replaceTagById('options-legend', 'div');
    }

    // Tableau : transformation tr/td en thead/th + caption
    const tableHeaderRow = document.getElementById('table-header-row');
    if (tableHeaderRow) {
        const cells = Array.from(tableHeaderRow.children);
        cells.forEach(cell => {
            const newTag = isAccessible ? 'th' : 'td';
            const newCell = document.createElement(newTag);
            newCell.innerHTML = cell.innerHTML;
            if (isAccessible) {
                newCell.setAttribute('scope', 'col'); // Définition de la portée
            }
            cell.parentNode.replaceChild(newCell, cell);
        });
    }
    
    let table = document.getElementById('pricing-table');
    if (isAccessible && !document.getElementById('table-caption')) {
        const caption = document.createElement('caption');
        caption.id = 'table-caption';
        caption.textContent = 'Tarifs des séjours selon la saison';
        table.insertBefore(caption, table.firstChild);
    } else if (!isAccessible && document.getElementById('table-caption')) {
        document.getElementById('table-caption').remove();
    }

    // ==========================================
    // 6. COMPOSANT COMPLEXE : ACCORDÉON
    // ==========================================
    const accPanel = document.getElementById('acc-panel-1');
    if (isAccessible) {
        // Transformation de la div cliquable en vrai button avec attributs ARIA
        replaceTagById('acc-trigger-1', 'button');
        const newTrigger = document.getElementById('acc-trigger-1');
        newTrigger.setAttribute('aria-expanded', accPanel.style.display === 'block' ? 'true' : 'false');
        newTrigger.setAttribute('aria-controls', 'acc-panel-1');
        accPanel.setAttribute('role', 'region');
    } else {
        replaceTagById('acc-trigger-1', 'div');
        const newTrigger = document.getElementById('acc-trigger-1');
        newTrigger.removeAttribute('aria-expanded');
        newTrigger.removeAttribute('aria-controls');
        accPanel.removeAttribute('role');
    }
    bindAccordion();
    bindBuyBtn();
    bindFormSubmit();
}

// Fonction utilitaire pour remplacer la balise d'un élément tout en conservant ses attributs
function replaceTagById(id, newTagName) {
    const element = document.getElementById(id);
    if (!element) return null;
    if (element.tagName.toLowerCase() === newTagName.toLowerCase()) return element;
    
    const newEl = document.createElement(newTagName);
    Array.from(element.attributes).forEach(attr => {
        newEl.setAttribute(attr.name, attr.value);
    });
    newEl.innerHTML = element.innerHTML;
    element.parentNode.replaceChild(newEl, element);
    return newEl;
}

// ==========================================
// GESTION DES ÉVÉNEMENTS
// ==========================================

function bindFakeBtn() {
    const btn = document.getElementById('fake-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        const notif = document.getElementById('notification-area');
        notif.textContent = 'Option ajoutée';
        setTimeout(() => notif.textContent = '', 3000);
    });
    
    // 🎤 Comportement Lecteur d'Écran :
    // Inaccessible : En cliquant sur la div, le texte s'affiche dans notification-area sans aria-live.
    // L'utilisateur aveugle n'entendra rien. La touche Entrée ne marche pas car c'est une div.
    // Accessible : notification-area possède aria-live="polite". Le lecteur d'écran 
    // l'intercepte et l'annonce à haute voix. La touche Entrée fonctionne (c'est un vrai button).
}

function bindAccordion() {
    const trigger = document.getElementById('acc-trigger-1');
    if (!trigger) return;
    
    trigger.addEventListener('click', function() {
        const panel = document.getElementById('acc-panel-1');
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        
        if (this.tagName.toLowerCase() === 'button') {
            this.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        }
    });
}

function bindBuyBtn() {
    const buyBtn = document.getElementById('buy-btn');
    if (!buyBtn) return;
    
    buyBtn.addEventListener('click', function() {
        if (!document.body.classList.contains('accessible')) {
            // Mode Inaccessible
            // 🎤 Comportement Lecteur d'Écran : Une alert() coupe violemment le flux. 
            // C'est une mauvaise pratique d'ergonomie et d'accessibilité car cela désoriente l'utilisateur
            // et déplace le focus arbitrairement.
            alert("Achat effectué");
        } else {
            // Mode Accessible
            const originalText = this.textContent;
            
            this.textContent = "✅ Achat validé";
            this.style.background = "#28a745"; // Vert de validation
            this.setAttribute("aria-live", "polite"); 
            // 🎤 Comportement Lecteur d'Écran : aria-live sur le bouton permet au lecteur 
            // de vocaliser le nouveau texte du bouton automatiquement dès qu'il change.
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = ""; // Reset to CSS
                this.removeAttribute("aria-live");
            }, 3000);
        }
    });
}

function bindFormSubmit() {
    const form = document.getElementById('booking-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const oldMsg = document.getElementById('form-feedback');
        if (oldMsg) oldMsg.remove();
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const nameGroup = document.getElementById('name-group');
        const emailGroup = document.getElementById('email-group');

        if (!document.body.classList.contains('accessible')) {
            // Mode Inaccessible
            // --- VALIDATION INACCESSIBLE ---
            let isValid = true;
            
            if (name && !name.value.trim()) {
                isValid = false;
                if (!document.getElementById('name-bad-error')) {
                    const err = document.createElement('span');
                    err.id = 'name-bad-error';
                    err.style.color = "#ff9999";
                    err.textContent = "Requis";
                    nameGroup.appendChild(err);
                }
            } else if (name) {
                const err = document.getElementById('name-bad-error');
                if (err) err.remove();
            }
            
            if (email && !email.value.trim()) {
                isValid = false;
                if (!document.getElementById('email-bad-error')) {
                    const err = document.createElement('span');
                    err.id = 'email-bad-error';
                    err.style.color = "#ff9999";
                    err.textContent = "Requis";
                    emailGroup.appendChild(err);
                }
            } else if (email) {
                const err = document.getElementById('email-bad-error');
                if (err) err.remove();
            }
            
            if (!isValid) return; // Stoppe sans annonce
            // -------------------------------
            
            // Pas de message de confirmation, on vide juste le formulaire.
            form.reset();
        } else {
            // Mode Accessible
            // --- VALIDATION ACCESSIBLE ---
            let isValid = true;
            let firstInvalid = null;
            
            if (name && !name.value.trim()) {
                isValid = false;
                name.setAttribute('aria-invalid', 'true');
                if (!document.getElementById('name-error')) {
                    const err = document.createElement('span');
                    err.id = 'name-error';
                    err.className = 'error-text';
                    err.textContent = 'Erreur : Le nom complet est obligatoire.';
                    nameGroup.appendChild(err);
                    name.setAttribute('aria-describedby', 'name-error');
                }
                if (!firstInvalid) firstInvalid = name;
            } else if (name) {
                name.removeAttribute('aria-invalid');
                name.removeAttribute('aria-describedby');
                const err = document.getElementById('name-error');
                if (err) err.remove();
            }
            
            if (email && !email.value.trim()) {
                isValid = false;
                email.setAttribute('aria-invalid', 'true');
                if (!document.getElementById('email-error')) {
                    const err = document.createElement('span');
                    err.id = 'email-error';
                    err.className = 'error-text';
                    err.textContent = 'Erreur : L\'adresse email est obligatoire.';
                    emailGroup.appendChild(err);
                    email.setAttribute('aria-describedby', 'email-error');
                }
                if (!firstInvalid) firstInvalid = email;
            } else if (email) {
                email.removeAttribute('aria-invalid');
                email.removeAttribute('aria-describedby');
                const err = document.getElementById('email-error');
                if (err) err.remove();
            }
            
            if (!isValid) {
                if (firstInvalid) firstInvalid.focus();
                
                const messageContainer = document.createElement('div');
                messageContainer.id = 'form-feedback';
                messageContainer.textContent = "❌ Erreur : Veuillez remplir tous les champs obligatoires.";
                messageContainer.style.background = "#f8d7da";
                messageContainer.style.color = "#721c24";
                messageContainer.style.border = "2px solid #f5c6cb";
                messageContainer.style.padding = "15px";
                messageContainer.style.borderRadius = "8px";
                messageContainer.style.marginBottom = "20px";
                messageContainer.style.fontWeight = "bold";
                messageContainer.setAttribute("role", "status");
                messageContainer.setAttribute("aria-live", "polite");
                form.parentNode.insertBefore(messageContainer, form);
                
                setTimeout(() => {
                    if (document.getElementById('form-feedback')) {
                        document.getElementById('form-feedback').remove();
                    }
                }, 6000);
                
                return;
            }
            // ----------------------------

            const messageContainer = document.createElement('div');
            messageContainer.id = 'form-feedback';

            const submitBtn = form.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Envoi en cours...";
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;

                const isSuccess = Math.random() > 0.5;

                if (isSuccess) {
                    messageContainer.textContent = "✅ Succès : Votre réservation est confirmée.";
                    messageContainer.style.background = "#E0E4F7";
                    messageContainer.style.color = "#2E419E";
                    messageContainer.style.border = "2px solid #2E419E";
                } else {
                    messageContainer.textContent = "❌ Erreur : Impossible de traiter votre demande. Veuillez réessayer.";
                    messageContainer.style.background = "#f8d7da";
                    messageContainer.style.color = "#721c24";
                    messageContainer.style.border = "2px solid #f5c6cb";
                }
                
                messageContainer.style.padding = "15px";
                messageContainer.style.borderRadius = "8px";
                messageContainer.style.marginBottom = "20px";
                messageContainer.style.fontWeight = "bold";
                
                // Attributs essentiels d'accessibilité
                messageContainer.setAttribute("role", "status");
                messageContainer.setAttribute("aria-live", "polite");
                messageContainer.setAttribute("tabindex", "-1"); // Permet de recevoir le focus via JS
                
                form.parentNode.insertBefore(messageContainer, form);
                
                // 🎤 Comportement Lecteur d'Écran : Forcer le focus sur le message garantit
                // qu'il sera la prochaine chose lue. tabindex="-1" évite que le message ne 
                // parasite la navigation Tab standard ultérieurement.
                messageContainer.focus();

                setTimeout(() => {
                    if (document.getElementById('form-feedback')) {
                        document.getElementById('form-feedback').remove();
                    }
                }, 6000);
            }, 1500); // 1.5s simulation d'envoi réseau
        }
    });
}

// ==========================================
// GESTION DE LA MODALE & FOCUS TRAP
// ==========================================
const modal = document.getElementById('ad-modal');
const closeModal = document.getElementById('close-modal');
const modalEmail = document.getElementById('modal-email');

// Ouverture automatique pour simuler un pop-up agressif
setTimeout(() => {
    modal.classList.add('open');
    if (!document.body.classList.contains('accessible')) {
        // ERREUR: Reverse focus trap. On donne le focus à un élément derrière la modale.
        // L'utilisateur naviguera au clavier à l'aveugle derrière le voile noir.
        const backgroundInput = document.getElementById('name');
        if(backgroundInput) backgroundInput.focus();
    } else {
        // CORRECTION: Focus initial dans la modale
        modalEmail.focus();
    }
}, 2500);

closeModal.addEventListener('click', () => {
    modal.classList.remove('open');
});

// Focus trap basique pour le mode accessible
document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('open') && document.body.classList.contains('accessible')) {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Maj + Tab
                if (document.activeElement === modalEmail) {
                    e.preventDefault();
                    closeModal.focus(); // Boucle sur la fin
                }
            } else { // Tab
                if (document.activeElement === closeModal) {
                    e.preventDefault();
                    modalEmail.focus(); // Boucle sur le début
                }
            }
        }
    }
});

// ==========================================
// RACCOURCIS & INITIALISATION
// ==========================================

// Raccourci clavier caché (Ctrl + Alt + A)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        toggleAccessibility();
    }
});

// Initialisation au chargement
bindFakeBtn();
bindAccordion();
bindBuyBtn();
bindFormSubmit();
