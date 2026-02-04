// ===== TOKEN CONFIG - JUST PASTE YOUR CONTRACT ADDRESS HERE =====
const TOKEN_CONFIG = {
    contractAddress: "F3kk9XxRAKJcAmbk8pY33jEnGEXDXS8q1UtreSodpump",
    chain: "solana"
};

// ===== Live Stats from DexScreener API =====
async function fetchLiveStats() {
    if (!TOKEN_CONFIG.contractAddress) {
        console.log("No contract address set - showing placeholders");
        return;
    }

    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONFIG.contractAddress}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            // Get the pair with highest liquidity
            const pair = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

            // Update Market Cap
            const mcapEl = document.getElementById('mcap');
            if (mcapEl && pair.marketCap) {
                const mcap = pair.marketCap;
                if (mcap >= 1000000) {
                    mcapEl.textContent = '$' + (mcap / 1000000).toFixed(2) + 'M';
                } else if (mcap >= 1000) {
                    mcapEl.textContent = '$' + (mcap / 1000).toFixed(1) + 'K';
                } else {
                    mcapEl.textContent = '$' + mcap.toFixed(0);
                }
            }

            // Update Contract Address display
            const caEl = document.getElementById('contractAddress');
            if (caEl) {
                caEl.textContent = TOKEN_CONFIG.contractAddress;
            }

            // Update Buy buttons with DexScreener link
            const dexLink = `https://dexscreener.com/${TOKEN_CONFIG.chain}/${TOKEN_CONFIG.contractAddress}`;
            document.querySelectorAll('.social-card.dex').forEach(el => {
                el.href = dexLink;
                el.target = '_blank';
            });

            // Update Pump.fun link
            const pumpLink = `https://pump.fun/${TOKEN_CONFIG.contractAddress}`;
            document.querySelectorAll('.btn-primary, .buy-btn').forEach(el => {
                if (el.textContent.includes('Buy') || el.textContent.includes('PNS')) {
                    el.href = pumpLink;
                    el.target = '_blank';
                }
            });

            console.log("Live stats updated:", { mcap: pair.marketCap, price: pair.priceUsd });
        }
    } catch (error) {
        console.error("Error fetching live stats:", error);
    }
}

// Fetch stats on load and every 30 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveStats();
    setInterval(fetchLiveStats, 30000); // Refresh every 30 seconds
});

// ===== Particles Animation =====
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#FFA347', '#FF47C3', '#8B4513', '#FFFFFF'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (15 + Math.random() * 20) + 's';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.width = (4 + Math.random() * 6) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== Copy Contract Address =====
function copyCA() {
    const ca = document.getElementById('contractAddress').textContent;

    if (ca === 'Coming Soon...') {
        showNotification('Contract address coming soon! 🚀');
        return;
    }

    navigator.clipboard.writeText(ca).then(() => {
        showNotification('Address copied! 💯');
    }).catch(() => {
        showNotification('Failed to copy 😢');
    });
}

// ===== Show Notification =====
function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(135deg, #FFA347, #FF47C3);
        color: #000;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 8px 32px rgba(255, 163, 71, 0.4);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// ===== Add notification animations =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== Smooth Scroll for Nav Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Animate Stats on Scroll =====
function animateValue(element, start, end, duration, prefix = '', suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * (end - start) + start);
        element.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate stats when hero section is visible
            if (entry.target.classList.contains('hero')) {
                const holdersEl = document.getElementById('holders');
                const mcapEl = document.getElementById('mcap');

                if (holdersEl && !holdersEl.dataset.animated) {
                    holdersEl.dataset.animated = 'true';
                    animateValue(holdersEl, 0, 2847, 2000, '', '');
                }
                if (mcapEl && !mcapEl.dataset.animated) {
                    mcapEl.dataset.animated = 'true';
                    animateValue(mcapEl, 0, 420, 2000, '$', 'K');
                }
            }
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('section, .hero').forEach(section => {
    observer.observe(section);
});

// ===== Navbar Background on Scroll =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===== Mouse Parallax Effect on Hero Logo =====
const heroLogo = document.querySelector('.hero-logo');
const logoContainer = document.querySelector('.logo-container');

if (logoContainer) {
    logoContainer.addEventListener('mousemove', (e) => {
        const rect = logoContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;

        heroLogo.style.transform = `translateY(${-20 + y}px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });

    logoContainer.addEventListener('mouseleave', () => {
        heroLogo.style.transform = 'translateY(0)';
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== Add hover effect to cards =====
document.querySelectorAll('.about-card, .step-card, .social-card').forEach(card => {
    card.addEventListener('mouseenter', function (e) {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function (e) {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== Easter Egg: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            showNotification('🤟 SHOCKED! You found the easter egg! 🤟');
            document.body.style.animation = 'shake 0.5s';
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);
