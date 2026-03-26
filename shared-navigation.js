(function () {
    function initFloatingNavigation() {
        if (document.body?.dataset?.disableGlobalNav === 'true') {
            return;
        }

        if (document.getElementById('global-floating-nav')) {
            return;
        }

        const path = window.location.pathname;
        const defaultHomeHref = /(?:login|index)\.html$/i.test(path) ? 'login.html' : 'axes.html';

        const state = {
            hideBack: false,
            hideHome: false,
            backAction: null,
            homeAction: null,
            homeHref: document.body?.dataset?.homeHref || defaultHomeHref
        };

        const style = document.createElement('style');
        style.textContent = `
            .global-floating-nav {
                position: fixed;
                left: 1rem;
                bottom: max(1rem, env(safe-area-inset-bottom));
                z-index: 70;
                display: flex;
                gap: 0.75rem;
                pointer-events: none;
            }

            .global-floating-nav__btn {
                pointer-events: auto;
                width: 3.25rem;
                height: 3.25rem;
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 999px;
                background: rgba(15, 23, 42, 0.88);
                color: #fff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
            }

            .global-floating-nav__btn:hover {
                transform: translateY(-2px);
                background: rgba(30, 41, 59, 0.96);
            }

            .global-floating-nav__btn:active {
                transform: translateY(0);
            }

            .global-floating-nav__btn--hidden {
                display: none;
            }

            .global-floating-nav__btn svg,
            .global-floating-nav__btn i {
                width: 1.2rem;
                height: 1.2rem;
            }

            @media (max-width: 640px) {
                .global-floating-nav {
                    left: 0.75rem;
                    bottom: max(0.75rem, env(safe-area-inset-bottom));
                }

                .global-floating-nav__btn {
                    width: 3rem;
                    height: 3rem;
                }
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'global-floating-nav';
        container.className = 'global-floating-nav';
        container.innerHTML = `
            <button type="button" id="global-back-button" class="global-floating-nav__btn" aria-label="חזרה אחורה" title="חזרה אחורה">
                <i data-lucide="arrow-right"></i>
            </button>
            <button type="button" id="global-home-button" class="global-floating-nav__btn" aria-label="מסך הבית" title="מסך הבית">
                <i data-lucide="house"></i>
            </button>
        `;

        document.body.appendChild(container);

        const backButton = container.querySelector('#global-back-button');
        const homeButton = container.querySelector('#global-home-button');

        function runAction(action, fallback) {
            if (typeof action === 'function') {
                action();
                return;
            }
            fallback();
        }

        function defaultBackAction() {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            window.location.href = state.homeHref;
        }

        function defaultHomeAction() {
            window.location.href = state.homeHref;
        }

        function render() {
            backButton.classList.toggle('global-floating-nav__btn--hidden', !!state.hideBack);
            homeButton.classList.toggle('global-floating-nav__btn--hidden', !!state.hideHome);
            if (window.lucide?.createIcons) {
                window.lucide.createIcons();
            }
        }

        backButton.addEventListener('click', () => runAction(state.backAction, defaultBackAction));
        homeButton.addEventListener('click', () => runAction(state.homeAction, defaultHomeAction));

        window.setFloatingNavState = function setFloatingNavState(nextState = {}) {
            Object.assign(state, nextState);
            render();
        };

        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingNavigation, { once: true });
    } else {
        initFloatingNavigation();
    }
})();